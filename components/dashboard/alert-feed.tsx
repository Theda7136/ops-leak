import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, formatHours } from "@/lib/format";
import {
  BOTTLENECK_LABELS,
  DISPLAY_CURRENCY,
  SEVERITY_LABELS,
  type OperationalAlertItem,
  type Severity,
} from "@/types";

const SEVERITY_VARIANT: Record<Severity, "critical" | "watch" | "low"> = {
  CRITICAL: "critical",
  MEDIUM: "watch",
  LOW: "low",
};

export function AlertFeed({ alerts }: { alerts: OperationalAlertItem[] }) {
  return (
    <section>
      <h2 className="section-label">Alertas</h2>
      {alerts.length === 0 ? (
        <p className="empty">
          Sin hallazgos. Cuando una jornada revele un cuello de botella, el
          resumen y la acción quedarán en este parte.
        </p>
      ) : (
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id} className="alert-row">
              <div className="alert-meta">
                <p>
                  <Badge variant={SEVERITY_VARIANT[alert.severity]}>
                    {SEVERITY_LABELS[alert.severity]}
                  </Badge>{" "}
                  <Badge variant="neutral">{BOTTLENECK_LABELS[alert.bottleneckType]}</Badge>
                </p>
                <p className="quiet">
                  {alert.projectName} · {formatDateTime(alert.createdAt)}
                </p>
              </div>
              <p className="alert-summary">{alert.summary}</p>
              <p className="meta">{alert.actionRecommended}</p>
              {alert.hoursLost > 0 || alert.costImpact > 0 ? (
                <p className="quiet">
                  {alert.hoursLost > 0 ? `${formatHours(alert.hoursLost)} h perdidas` : null}
                  {alert.hoursLost > 0 && alert.costImpact > 0 ? " · " : null}
                  {alert.costImpact > 0
                    ? `Sobrecosto ${formatCurrency(alert.costImpact, DISPLAY_CURRENCY)}`
                    : null}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
