import { z } from "zod";

import { LIMITS, cleanText, isCalendarDate } from "@/lib/text";

const trimmed = (max: number) =>
  z
    .string()
    .transform((value) => cleanText(value, max));

export const projectSchema = z
  .object({
    name: trimmed(LIMITS.name).pipe(
      z.string().min(2, "El nombre del proyecto es obligatorio."),
    ),
    clientName: trimmed(LIMITS.clientName).pipe(
      z.string().min(2, "El cliente es obligatorio."),
    ),
    totalBudget: z.coerce
      .number({ invalid_type_error: "El presupuesto debe ser un número." })
      .finite("El presupuesto debe ser un número finito.")
      .positive("El presupuesto debe ser mayor a 0.")
      .max(LIMITS.money, "El presupuesto supera el límite permitido."),
    startDate: z
      .string()
      .refine(isCalendarDate, "La fecha de inicio no es válida."),
    estimatedEndDate: z
      .string()
      .refine(isCalendarDate, "La fecha de cierre no es válida."),
  })
  .refine((value) => value.estimatedEndDate >= value.startDate, {
    message: "La fecha de cierre debe ser igual o posterior al inicio.",
    path: ["estimatedEndDate"],
  });

export const reportSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, "Selecciona un proyecto.")
    .max(64, "El proyecto seleccionado no es válido.")
    .regex(/^[a-z0-9]+$/i, "El proyecto seleccionado no es válido."),
  date: z.string().refine(isCalendarDate, "Indica una fecha válida."),
  rawContent: trimmed(LIMITS.report).pipe(
    z.string().min(10, "Describe la jornada con al menos 10 caracteres."),
  ),
  hoursLogged: z.coerce
    .number({ invalid_type_error: "Las horas deben ser un número." })
    .finite("Las horas deben ser un número finito.")
    .nonnegative("Las horas no pueden ser negativas.")
    .max(LIMITS.hours, "Las horas superan el límite de una jornada."),
  materialCosts: z.coerce
    .number({ invalid_type_error: "Los costos deben ser un número." })
    .finite("Los costos deben ser un número finito.")
    .nonnegative("Los costos no pueden ser negativos.")
    .max(LIMITS.money, "Los costos superan el límite permitido."),
  supervisorName: trimmed(LIMITS.supervisor).pipe(
    z.string().min(2, "Indica el nombre del supervisor."),
  ),
});
