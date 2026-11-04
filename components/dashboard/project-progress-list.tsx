import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DISPLAY_CURRENCY,
  PROJECT_STATUS_LABELS,
  type ProjectProgress,
  type ProjectStatus,
} from "@/types";

const STATUS_VARIANT: Record<ProjectStatus, "normal" | "watch" | "neutral"> = {
  ACTIVE: "normal",
  AT_RISK: "watch",
  COMPLETED: "neutral",
};

const BAR_COLOR: Record<"normal" | "watch" | "critical" | "unknown", string> = {
  normal: "bg-emerald-400",
  watch: "bg-amber-400",
  critical: "bg-red-400",
  unknown: "bg-slate-600",
};

function progressTone(ratio: number | null): "normal" | "watch" | "critical" | "unknown" {
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

export function ProjectProgressList({ projects }: { projects: ProjectProgress[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos activos</CardTitle>
        <CardDescription>
          Ejecución presupuestaria según los costos de material reportados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No hay proyectos en curso. Cuando exista una operación activa, aquí
            verás cuánto presupuesto ya se ejecutó.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {projects.map((project) => {
              const tone = progressTone(project.ratio);
              const width =
                project.ratio === null ? 0 : Math.min(project.ratio, 1) * 100;

              return (
                <li key={project.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{project.name}</p>
                        <Badge variant={STATUS_VARIANT[project.status]}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.clientName}</p>
                    </div>
                    <p className="text-sm tabular-nums text-slate-200">
                      {formatCurrency(project.spent, DISPLAY_CURRENCY)}
                      <span className="text-muted-foreground">
                        {" "}
                        / {formatCurrency(project.totalBudget, DISPLAY_CURRENCY)}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", BAR_COLOR[tone])}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {project.ratio === null
                          ? "Sin presupuesto"
                          : formatPercent(project.ratio)}
                      </span>
                      <span>
                        {formatDate(project.startDate)} – {formatDate(project.estimatedEndDate)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
