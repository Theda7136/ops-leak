"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createProjectAction } from "@/app/actions/projects";
import { projectSchema } from "@/lib/schemas";

type ProjectFormValues = z.infer<typeof projectSchema>;

const fieldClassName = "field";

export function ProjectForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      clientName: "",
      totalBudget: 0,
      startDate: "",
      estimatedEndDate: "",
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    setFormError(null);

    try {
      const result = await createProjectAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("No se pudo crear el proyecto.");
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="stack">
        <span>Nombre del proyecto</span>
        <input
          type="text"
          maxLength={120}
          placeholder="Torre Residencial Sur"
          {...register("name")}
          className={fieldClassName}
        />
        {errors.name ? (
          <span className="error">{errors.name.message}</span>
        ) : null}
      </label>

      <label className="stack">
        <span>Cliente</span>
        <input
          type="text"
          maxLength={120}
          placeholder="Constructora Andina"
          {...register("clientName")}
          className={fieldClassName}
        />
        {errors.clientName ? (
          <span className="error">{errors.clientName.message}</span>
        ) : null}
      </label>

      <label className="stack">
        <span>Presupuesto inicial</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="50000"
          {...register("totalBudget")}
          className={fieldClassName}
        />
        {errors.totalBudget ? (
          <span className="error">{errors.totalBudget.message}</span>
        ) : null}
      </label>

      <div className="form-grid two">
        <label className="stack">
          <span>Inicio</span>
          <input type="date" {...register("startDate")} className={fieldClassName} />
          {errors.startDate ? (
            <span className="error">{errors.startDate.message}</span>
          ) : null}
        </label>
        <label className="stack">
          <span>Cierre estimado</span>
          <input
            type="date"
            {...register("estimatedEndDate")}
            className={fieldClassName}
          />
          {errors.estimatedEndDate ? (
            <span className="error">{errors.estimatedEndDate.message}</span>
          ) : null}
        </label>
      </div>

      {formError ? (
        <p className="error">{formError}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? "Guardando..." : "Guardar proyecto"}
      </button>
    </form>
  );
}
