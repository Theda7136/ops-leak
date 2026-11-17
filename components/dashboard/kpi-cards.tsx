import { formatCurrency, formatPercent } from "@/lib/format";
import {
  DISPLAY_CURRENCY,
  type ExecutiveDashboard,
  type OperationalStatus,
} from "@/types";

export function KpiCards({ dashboard }: { dashboard: ExecutiveDashboard }) {
  const ratio =
    dashboard.totalBudget > 0 ? dashboard.totalSpent / dashboard.totalBudget : null;

  return (
    <section className="ledger" aria-label="Indicadores">
      <article>
        <p className="kicker">Presupuesto</p>
        <p className={`figure ${dashboard.budgetStatus}`}>
          {formatCurrency(dashboard.totalBudget, DISPLAY_CURRENCY)}
        </p>
        <p className="meta">
          Ejecutado {formatCurrency(dashboard.totalSpent, DISPLAY_CURRENCY)}
          {ratio !== null ? ` · ${formatPercent(ratio)}` : ""}
        </p>
      </article>
      <article>
        <p className="kicker">En riesgo</p>
        <p className={`figure ${tone(dashboard.projectsAtRiskStatus)}`}>
          {dashboard.projectsAtRisk}
        </p>
        <p className="meta">Obras con desviación o cuello de botella.</p>
      </article>
      <article>
        <p className="kicker">Críticas</p>
        <p className={`figure ${tone(dashboard.criticalAlertsStatus)}`}>
          {dashboard.criticalAlerts}
        </p>
        <p className="meta">Alertas que siguen exigiendo una decisión.</p>
      </article>
    </section>
  );
}

function tone(status: OperationalStatus): OperationalStatus {
  return status;
}
