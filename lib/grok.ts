import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import {
  BOTTLENECK_TYPES,
  SEVERITIES,
  type DailyReportAnalysis,
  type ProjectContext,
} from "@/types";

const analysisSchema = z.object({
  summary: z.string().min(1),
  hoursLost: z.number().nonnegative(),
  costImpact: z.number().nonnegative(),
  severity: z.enum(SEVERITIES),
  bottleneckType: z.enum(BOTTLENECK_TYPES),
  actionRecommended: z.string().min(1),
});

export class GrokAnalysisError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GrokAnalysisError";
  }
}

const SYSTEM_PROMPT = `Eres el analista operacional de OpsLeak. Recibes un reporte diario de campo y el contexto del proyecto. Devuelves solo un objeto JSON con esta forma:
{
  "summary": "una frase con lo ocurrido en la jornada",
  "hoursLost": 0,
  "costImpact": 0,
  "severity": "LOW" | "MEDIUM" | "CRITICAL",
  "bottleneckType": "MATERIAL_DELAY" | "EQUIPMENT_FAILURE" | "LABOR_IDLE" | "WEATHER" | "OTHER",
  "actionRecommended": "una acción concreta e inmediata para el director operativo"
}
Reglas:
- hoursLost es el número estimado de horas operativas perdidas.
- costImpact es el sobrecosto estimado. Usa 0 si no aplica.
- severity: LOW si la jornada está dentro de lo esperado, MEDIUM si hay riesgo moderado, CRITICAL si hay un cuello de botella o desviación grave.
- No incluyas markdown ni texto fuera del JSON.`;

let grokClient: OpenAI | null = null;

function getGrokClient(): OpenAI {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    throw new GrokAnalysisError("Falta XAI_API_KEY en el entorno.");
  }

  if (!grokClient) {
    grokClient = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });
  }

  return grokClient;
}

function readJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(jsonText) as unknown;
}

export async function analyzeDailyReport(
  reportContent: string,
  projectContext: ProjectContext,
): Promise<DailyReportAnalysis> {
  const rawContent = reportContent.trim();

  if (!rawContent) {
    throw new GrokAnalysisError("El reporte de campo está vacío.");
  }

  try {
    const client = getGrokClient();
    const context = [
      `Proyecto: ${projectContext.name}`,
      `Cliente: ${projectContext.clientName}`,
      `Estado: ${projectContext.status}`,
      `Presupuesto total: ${projectContext.totalBudget}`,
      `Ejecutado a la fecha: ${projectContext.spentToDate}`,
      `Horas registradas en la jornada: ${projectContext.hoursLogged}`,
      `Costos de material del día: ${projectContext.materialCosts}`,
      `Reporte:\n${rawContent}`,
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: process.env.GROK_MODEL ?? "grok-3",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: context },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new GrokAnalysisError("Grok no devolvió contenido analizable.");
    }

    return analysisSchema.parse(readJsonContent(content));
  } catch (error) {
    if (error instanceof GrokAnalysisError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new GrokAnalysisError(
        "La respuesta de Grok no cumple el esquema operacional.",
        { cause: error },
      );
    }

    throw new GrokAnalysisError("No se pudo analizar el reporte con Grok.", {
      cause: error,
    });
  }
}
