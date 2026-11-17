"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createDailyReport } from "@/app/actions/reports";
import { reportSchema } from "@/lib/schemas";
import type { ReportProjectOption } from "@/types";

type ReportFormValues = z.infer<typeof reportSchema>;

const fieldClassName = "field";

function todayInputValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function ReportForm({ projects }: { projects: ReportProjectOption[] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
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
    setFormNotice(null);

    try {
      const result = await createDailyReport(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      if (result.message.includes("no pudo") || result.message.includes("no se pudo")) {
        setFormNotice(result.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("No se pudo enviar el reporte.");
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid two">
        <label className="stack span-2">
          <span>Proyecto</span>
          <select {...register("projectId")} className={fieldClassName}>
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} · {project.clientName}
              </option>
            ))}
          </select>
          {errors.projectId ? (
            <span className="error">{errors.projectId.message}</span>
          ) : null}
        </label>

        <label className="stack">
          <span>Fecha</span>
          <input type="date" {...register("date")} className={fieldClassName} />
          {errors.date ? (
            <span className="error">{errors.date.message}</span>
          ) : null}
        </label>

        <label className="stack">
          <span>Supervisor</span>
          <input
            type="text"
            maxLength={80}
            placeholder="Nombre de quien reporta"
            {...register("supervisorName")}
            className={fieldClassName}
          />
          {errors.supervisorName ? (
            <span className="error">{errors.supervisorName.message}</span>
          ) : null}
        </label>

        <label className="stack">
          <span>Horas invertidas</span>
          <input
            type="number"
            min="0"
            step="0.5"
            {...register("hoursLogged")}
            className={fieldClassName}
          />
          {errors.hoursLogged ? (
            <span className="error">{errors.hoursLogged.message}</span>
          ) : null}
        </label>

        <label className="stack">
          <span>Costos del día</span>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("materialCosts")}
            className={fieldClassName}
          />
          {errors.materialCosts ? (
            <span className="error">{errors.materialCosts.message}</span>
          ) : null}
        </label>
      </div>

      <label className="stack">
        <span>Notas de la jornada</span>
        <textarea
          rows={7}
          maxLength={8000}
          placeholder="Qué ocurrió en campo: retrasos, equipos, clima, personal ocioso..."
          {...register("rawContent")}
          className={fieldClassName}
        />
        {errors.rawContent ? (
          <span className="error">{errors.rawContent.message}</span>
        ) : (
          <span className="quiet">
            Grok leerá este texto y devolverá severidad, cuello de botella y una acción.
          </span>
        )}
      </label>

      {formNotice ? (
        <p className="notice">{formNotice}</p>
      ) : null}

      {formError ? (
        <p className="error">{formError}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? "Analizando reporte..." : "Registrar reporte"}
      </button>
    </form>
  );
}
