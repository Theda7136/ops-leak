import Link from "next/link";

import { AlertFeed } from "@/components/dashboard/alert-feed";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectProgressList } from "@/components/dashboard/project-progress-list";
import { getExecutiveDashboard } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tablero · OpsLeak",
};

export default async function DashboardPage() {
  const dashboard = await getExecutiveDashboard();

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Centro de operaciones</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Presupuesto de la cartera, proyectos en riesgo y alertas críticas
            detectadas en los reportes de campo.
          </p>
        </div>

        {/* Contenedor agrupado para alinear ordenadamente ambos botones */}
        <div className="flex items-center gap-3">
          <Link
            href="/reports/new"
            className="inline-flex w-fit items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
          >
            Nuevo reporte
          </Link>
          
          <Link href="/projects/new">
            <Button variant="outline">+ Nuevo Proyecto</Button>
          </Link>
        </div>
      </header>

      {dashboard.dataSource === "unavailable" ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No se pudo leer la base de datos. Revisa{" "}
          <code className="font-mono text-amber-50">DATABASE_URL</code> y vuelve a
          cargar el tablero.
        </div>
      ) : null}

      <KpiCards dashboard={dashboard} />
      <ProjectProgressList projects={dashboard.activeProjects} />
      <AlertFeed alerts={dashboard.alerts} />
    </>
  );
}