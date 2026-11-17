import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
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
    <section>
      <h2 className="section-label">Obras en curso</h2>
      {projects.length === 0 ? (
        <p className="empty">
          Todavía no hay obras abiertas. Registra un proyecto para ver cuánto
          presupuesto se ha ejecutado.
        </p>
      ) : (
        <ul>
          {projects.map((project) => {
            const tone = progressTone(project.ratio);
            const width =
              project.ratio === null ? 0 : Math.min(project.ratio, 1) * 100;

            return (
              <li key={project.id} className="project-row">
                <div className="row-top">
                  <div>
                    <p className="project-name">
                      {project.name}{" "}
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </p>
                    <p className="quiet">{project.clientName}</p>
                  </div>
                  <p className="money">
                    {formatCurrency(project.spent, DISPLAY_CURRENCY)}
                    <span> / {formatCurrency(project.totalBudget, DISPLAY_CURRENCY)}</span>
                  </p>
                </div>
                <div className="track" aria-hidden="true">
                  <i className={tone} style={{ width: `${width}%` }} />
                </div>
                <div className="row-top quiet">
                  <span>
                    {project.ratio === null ? "Sin presupuesto" : formatPercent(project.ratio)}
                  </span>
                  <span>
                    {formatDate(project.startDate)} – {formatDate(project.estimatedEndDate)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
