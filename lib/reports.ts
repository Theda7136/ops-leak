import "server-only";

import { revalidatePath } from "next/cache";

import { analyzeDailyReport, GrokAnalysisError } from "@/lib/grok";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/schemas";
import { noonUtcFromDateInput, safeErrorText } from "@/lib/text";
import {
  PROJECT_STATUSES,
  type ProjectContext,
  type ProjectStatus,
  type ReportActionResult,
  type ReportProjectOption,
} from "@/types";

function toNumber(value: number | null | undefined): number {
  return value ?? 0;
}

function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
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

export async function listReportProjects(): Promise<{
  projects: ReportProjectOption[];
  unavailable: boolean;
}> {
  try {
    const projects = await prisma.project.findMany({
      where: { status: { not: "COMPLETED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientName: true },
    });

    return { projects, unavailable: false };
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      console.error("No se pudieron cargar los proyectos.", safeErrorText(error));
    }

    return { projects: [], unavailable: true };
  }
}

export async function submitDailyReport(
  input: unknown,
): Promise<ReportActionResult> {
  if (!consumeRateLimit("submit-report", 12, 60_000)) {
    return {
      ok: false,
      message: "Demasiados reportes en poco tiempo. Espera un minuto.",
    };
  }

  const parsed = reportSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del reporte.",
    };
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: {
        id: true,
        name: true,
        clientName: true,
        totalBudget: true,
        status: true,
      },
    });

    if (!project || !isProjectStatus(project.status)) {
      return { ok: false, message: "El proyecto seleccionado no existe." };
    }

    if (project.status === "COMPLETED") {
      return {
        ok: false,
        message: "Ese proyecto ya está cerrado y no admite reportes.",
      };
    }

    const spent = await prisma.dailyReport.aggregate({
      where: { projectId: project.id },
      _sum: { materialCosts: true },
    });

    const projectContext: ProjectContext = {
      name: project.name,
      clientName: project.clientName,
      totalBudget: toNumber(project.totalBudget),
      status: project.status,
      spentToDate: toNumber(spent._sum.materialCosts),
      hoursLogged: parsed.data.hoursLogged,
      materialCosts: parsed.data.materialCosts,
    };

    await prisma.dailyReport.create({
      data: {
        projectId: project.id,
        date: noonUtcFromDateInput(parsed.data.date),
        rawContent: parsed.data.rawContent,
        hoursLogged: parsed.data.hoursLogged,
        materialCosts: parsed.data.materialCosts,
        supervisorName: parsed.data.supervisorName,
      },
    });

    try {
      const analysis = await analyzeDailyReport(
        parsed.data.rawContent,
        projectContext,
      );

      await prisma.operationalAlert.create({
        data: {
          projectId: project.id,
          severity: analysis.severity,
          bottleneckType: analysis.bottleneckType,
          summary: analysis.summary,
          actionRecommended: analysis.actionRecommended,
          hoursLost: analysis.hoursLost,
          costImpact: analysis.costImpact,
        },
      });

      if (
        project.status === "ACTIVE" &&
        (analysis.severity === "MEDIUM" || analysis.severity === "CRITICAL")
      ) {
        await prisma.project.update({
          where: { id: project.id },
          data: { status: "AT_RISK" },
        });
      }
    } catch (error) {
      revalidatePath("/dashboard");

      if (error instanceof GrokAnalysisError) {
        return {
          ok: true,
          message:
            "El reporte quedó guardado, pero Grok no pudo generar la alerta.",
        };
      }

      console.error("No se pudo guardar la alerta.", safeErrorText(error));
      return {
        ok: true,
        message:
          "El reporte quedó guardado, pero no se pudo registrar la alerta.",
      };
    }

    revalidatePath("/dashboard");
    return {
      ok: true,
      message: "Reporte registrado y analizado.",
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return {
        ok: false,
        message: "No se pudo escribir en la base de datos.",
      };
    }

    console.error("No se pudo registrar el reporte diario.", safeErrorText(error));
    return {
      ok: false,
      message: "No se pudo registrar el reporte. Inténtalo de nuevo.",
    };
  }
}
