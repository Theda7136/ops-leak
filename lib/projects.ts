import "server-only";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { projectSchema } from "@/lib/schemas";
import { noonUtcFromDateInput, safeErrorText } from "@/lib/text";
import type { ReportActionResult } from "@/types";

export async function createProject(input: unknown): Promise<ReportActionResult> {
  if (!consumeRateLimit("create-project", 20, 60_000)) {
    return {
      ok: false,
      message: "Demasiados intentos. Espera un minuto.",
    };
  }

  const parsed = projectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del proyecto.",
    };
  }

  try {
    await prisma.project.create({
      data: {
        name: parsed.data.name,
        clientName: parsed.data.clientName,
        totalBudget: parsed.data.totalBudget,
        startDate: noonUtcFromDateInput(parsed.data.startDate),
        estimatedEndDate: noonUtcFromDateInput(parsed.data.estimatedEndDate),
        status: "ACTIVE",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/reports/new");
    return { ok: true, message: "Proyecto creado." };
  } catch (error) {
    console.error("No se pudo crear el proyecto.", safeErrorText(error));
    return {
      ok: false,
      message: "No se pudo crear el proyecto. Inténtalo de nuevo.",
    };
  }
}
