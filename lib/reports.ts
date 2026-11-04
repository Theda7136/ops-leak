import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { analyzeDailyReport, GrokAnalysisError } from "@/lib/grok";
import { prisma } from "@/lib/prisma";
import {
  PROJECT_STATUSES,
  type ProjectContext,
  type ProjectStatus,
  type ReportActionResult,
  type ReportProjectOption,
} from "@/types";

const reportSchema = z.object({
  projectId: z.string().min(1, "Selecciona un proyecto."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indica una fecha válida."),
  rawContent: z
    .string()
    .trim()
    .min(10, "Describe la jornada con al menos 10 caracteres."),
  hoursLogged: z.coerce
    .number({ invalid_type_error: "Las horas deben ser un número." })
    .nonnegative("Las horas no pueden ser negativas."),
  materialCosts: z.coerce
    .number({ invalid_type_error: "Los costos deben ser un número." })
    .nonnegative("Los costos no pueden ser negativos."),
  supervisorName: z
    .string()
    .trim()
    .min(2, "Indica el nombre del supervisor."),
});

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

  return (
    error.name === "PrismaClientInitializationError" ||
    code === "P1001" ||
    error.message.includes("Can't reach database server")
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
      console.error("No se pudieron cargar los proyectos.", error);
    }

    return { projects: [], unavailable: true };
  }
}

export async function submitDailyReport(
  input: unknown,
): Promise<ReportActionResult> {
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
      include: {
        reports: { select: { materialCosts: true } },
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

    const spentToDate = project.reports.reduce(
      (sum, report) => sum + toNumber(report.materialCosts),
      0,
    );
    const projectContext: ProjectContext = {
      name: project.name,
      clientName: project.clientName,
      totalBudget: toNumber(project.totalBudget),
      status: project.status,
      spentToDate,
      hoursLogged: parsed.data.hoursLogged,
      materialCosts: parsed.data.materialCosts,
    };

    const reportDate = new Date(`${parsed.data.date}T12:00:00.000Z`);

    await prisma.dailyReport.create({
      data: {
        projectId: project.id,
        date: reportDate,
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
      if (error instanceof GrokAnalysisError) {
        revalidatePath("/dashboard");
        return {
          ok: true,
          message:
            "El reporte quedó guardado, pero Grok no pudo generar la alerta.",
        };
      }

      throw error;
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
        message: "No se pudo escribir en PostgreSQL. Revisa DATABASE_URL.",
      };
    }

    console.error("No se pudo registrar el reporte diario.", error);
    return {
      ok: false,
      message: "No se pudo registrar el reporte. Inténtalo de nuevo.",
    };
  }
}
