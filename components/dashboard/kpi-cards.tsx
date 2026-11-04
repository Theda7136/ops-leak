import { AlertTriangle, FolderKanban, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DISPLAY_CURRENCY,
  type ExecutiveDashboard,
  type OperationalStatus,
} from "@/types";

const STATUS_TEXT: Record<OperationalStatus, string> = {
  normal: "text-emerald-300",
  watch: "text-amber-300",
  critical: "text-red-300",
  unknown: "text-slate-200",
};

export function KpiCards({ dashboard }: { dashboard: ExecutiveDashboard }) {
  const ratio =
    dashboard.totalBudget > 0 ? dashboard.totalSpent / dashboard.totalBudget : null;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Wallet className="size-4" />
            Presupuesto total
          </CardDescription>
          <CardTitle className={cn("text-2xl tabular-nums", STATUS_TEXT[dashboard.budgetStatus])}>
            {formatCurrency(dashboard.totalBudget, DISPLAY_CURRENCY)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ejecutado {formatCurrency(dashboard.totalSpent, DISPLAY_CURRENCY)}
            {ratio !== null ? ` · ${formatPercent(ratio)}` : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <FolderKanban className="size-4" />
            Proyectos en riesgo
          </CardDescription>
          <CardTitle
            className={cn(
              "text-2xl tabular-nums",
              STATUS_TEXT[dashboard.projectsAtRiskStatus],
            )}
          >
            {dashboard.projectsAtRisk}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Operaciones marcadas en riesgo por desviación o cuello de botella.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Alertas críticas
          </CardDescription>
          <CardTitle
            className={cn(
              "text-2xl tabular-nums",
              STATUS_TEXT[dashboard.criticalAlertsStatus],
            )}
          >
            {dashboard.criticalAlerts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hallazgos de severidad crítica generados desde los reportes de campo.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
