import "server-only";

import { prisma } from "@/lib/prisma";
import {
  PROJECT_STATUSES,
  type ExecutiveDashboard,
  type OperationalStatus,
  type OperationalAlertItem,
  type ProjectProgress,
  type ProjectStatus,
} from "@/types";

function toNumber(value: number | null | undefined): number {
  return value ?? 0;
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const message = error.message.toLowerCase();

  return (
    error.name === "PrismaClientInitializationError" ||
    code === "P1001" ||
    message.includes("can't reach database server") ||
    message.includes("unable to open database") ||
    message.includes("sqlite")
  );
}

function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
}

function budgetStatus(ratio: number | null): OperationalStatus {
  if (ratio === null) {
    return "unknown";
  }

  if (ratio >= 1) {
    return "critical";
  }

  if (ratio >= 0.85) {
    return "watch";
  }

  return "normal";
}

function emptyDashboard(): ExecutiveDashboard {
  return {
    totalBudget: 0,
    totalSpent: 0,
    budgetStatus: "unknown",
    projectsAtRisk: 0,
    projectsAtRiskStatus: "unknown",
    criticalAlerts: 0,
    criticalAlertsStatus: "unknown",
    activeProjects: [],
    alerts: [],
    dataSource: "unavailable",
  };
}

export async function getExecutiveDashboard(): Promise<ExecutiveDashboard> {
  try {
    const [projects, projectsAtRisk, criticalAlerts, alertRows, spendRows] = await Promise.all([
      prisma.project.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.project.count({
        where: { status: "AT_RISK" },
      }),
      prisma.operationalAlert.count({
        where: { severity: "CRITICAL" },
      }),
      prisma.operationalAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          project: {
            select: { name: true },
          },
        },
      }),
      prisma.dailyReport.groupBy({
        by: ["projectId"],
        _sum: { materialCosts: true },
      }),
    ]);

    const spentByProject = new Map(
      spendRows.map((row) => [row.projectId, toNumber(row._sum.materialCosts)]),
    );

    const alerts: OperationalAlertItem[] = alertRows.map((alert) => ({
      id: alert.id,
      projectName: alert.project.name,
      severity: alert.severity,
      bottleneckType: alert.bottleneckType,
      summary: alert.summary,
      actionRecommended: alert.actionRecommended,
      hoursLost: toNumber(alert.hoursLost),
      costImpact: toNumber(alert.costImpact),
      createdAt: alert.createdAt,
    }));

    let totalBudget = 0;
    let totalSpent = 0;
    const activeProjects: ProjectProgress[] = [];

    for (const project of projects) {
      const budget = toNumber(project.totalBudget);
      const spent = spentByProject.get(project.id) ?? 0;

      totalBudget += budget;
      totalSpent += spent;

      if (!isProjectStatus(project.status) || project.status === "COMPLETED") {
        continue;
      }

      activeProjects.push({
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        status: project.status,
        totalBudget: budget,
        spent,
        ratio: budget > 0 ? spent / budget : null,
        startDate: project.startDate,
        estimatedEndDate: project.estimatedEndDate,
      });
    }

    const portfolioRatio = totalBudget > 0 ? totalSpent / totalBudget : null;

    return {
      totalBudget,
      totalSpent,
      budgetStatus: budgetStatus(portfolioRatio),
      projectsAtRisk,
      projectsAtRiskStatus: projectsAtRisk > 0 ? "watch" : "normal",
      criticalAlerts,
      criticalAlertsStatus: criticalAlerts > 0 ? "critical" : "normal",
      activeProjects,
      alerts,
      dataSource: "database",
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      console.warn("La base de datos no está disponible. El tablero muestra ceros.");
      return emptyDashboard();
    }

    console.error("No se pudo construir el tablero ejecutivo.", error);
    return emptyDashboard();
  }
}
