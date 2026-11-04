"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createDailyReport } from "@/app/actions/reports";
import type { ReportProjectOption } from "@/types";

const reportFormSchema = z.object({
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
  supervisorName: z.string().trim().min(2, "Indica el nombre del supervisor."),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const fieldClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-sky-400/40 placeholder:text-muted-foreground focus:ring-2";

function todayInputValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function ReportForm({ projects }: { projects: ReportProjectOption[] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      projectId: "",
      date: todayInputValue(),
      rawContent: "",
      hoursLogged: 0,
      materialCosts: 0,
      supervisorName: "",
    },
  });

  async function onSubmit(values: ReportFormValues) {
    setFormError(null);

    try {
      const result = await createDailyReport(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("No se pudo enviar el reporte.");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="text-slate-200">Proyecto</span>
          <select {...register("projectId")} className={fieldClassName}>
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} · {project.clientName}
              </option>
            ))}
          </select>
          {errors.projectId ? (
            <span className="block text-xs text-red-300">{errors.projectId.message}</span>
          ) : null}
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-slate-200">Fecha</span>
          <input type="date" {...register("date")} className={fieldClassName} />
          {errors.date ? (
            <span className="block text-xs text-red-300">{errors.date.message}</span>
          ) : null}
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-slate-200">Supervisor</span>
          <input
            type="text"
            placeholder="Nombre de quien reporta"
            {...register("supervisorName")}
            className={fieldClassName}
          />
          {errors.supervisorName ? (
            <span className="block text-xs text-red-300">
              {errors.supervisorName.message}
            </span>
          ) : null}
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-slate-200">Horas invertidas</span>
          <input
            type="number"
            min="0"
            step="0.5"
            {...register("hoursLogged")}
            className={fieldClassName}
          />
          {errors.hoursLogged ? (
            <span className="block text-xs text-red-300">{errors.hoursLogged.message}</span>
          ) : null}
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-slate-200">Costos del día</span>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("materialCosts")}
            className={fieldClassName}
          />
          {errors.materialCosts ? (
            <span className="block text-xs text-red-300">
              {errors.materialCosts.message}
            </span>
          ) : null}
        </label>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="text-slate-200">Notas de la jornada</span>
        <textarea
          rows={7}
          placeholder="Qué ocurrió en campo: retrasos, equipos, clima, personal ocioso..."
          {...register("rawContent")}
          className={fieldClassName}
        />
        {errors.rawContent ? (
          <span className="block text-xs text-red-300">{errors.rawContent.message}</span>
        ) : (
          <span className="block text-xs text-muted-foreground">
            Grok leerá este texto y devolverá severidad, cuello de botella y una acción.
          </span>
        )}
      </label>

      {formError ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
      >
        {isSubmitting ? "Analizando reporte..." : "Registrar reporte"}
      </button>
    </form>
  );
}
