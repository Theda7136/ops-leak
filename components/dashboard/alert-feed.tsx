import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  BOTTLENECK_LABELS,
  SEVERITY_LABELS,
  type OperationalAlertItem,
  type Severity,
} from "@/types";

const SEVERITY_VARIANT: Record<Severity, "critical" | "watch" | "low"> = {
  CRITICAL: "critical",
  MEDIUM: "watch",
  LOW: "low",
};

const SEVERITY_ACCENT: Record<Severity, string> = {
  CRITICAL: "border-l-red-400",
  MEDIUM: "border-l-amber-400",
  LOW: "border-l-sky-400",
};

export function AlertFeed({ alerts }: { alerts: OperationalAlertItem[] }) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          Feed de alertas operativas
        </h2>
        <p className="text-sm text-muted-foreground">
          Hallazgos más recientes extraídos de los reportes de campo.
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card className="border-dashed bg-card/60">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
              <Bell className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Sin alertas operativas</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Cuando un reporte de campo revele un cuello de botella, la
                severidad, el resumen y la acción recomendada aparecerán aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <Card className={cn("border-l-2", SEVERITY_ACCENT[alert.severity])}>
                <CardHeader className="gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={SEVERITY_VARIANT[alert.severity]}>
                      {SEVERITY_LABELS[alert.severity]}
                    </Badge>
                    <Badge variant="neutral">
                      {BOTTLENECK_LABELS[alert.bottleneckType]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.projectName}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {alert.summary}
                  </CardTitle>
                  <CardDescription>{formatDateTime(alert.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-200">
                    <span className="text-muted-foreground">Acción recomendada. </span>
                    {alert.actionRecommended}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
