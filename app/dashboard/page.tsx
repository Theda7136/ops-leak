import Link from "next/link";

import { AlertFeed } from "@/components/dashboard/alert-feed";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectProgressList } from "@/components/dashboard/project-progress-list";
import { getExecutiveDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parte del día · OpsLeak",
};

export default async function DashboardPage() {
  const dashboard = await getExecutiveDashboard();

  return (
    <>
      <header className="page-head">
        <div>
          <p className="kicker">Hoy en obra</p>
          <h1>Parte del día</h1>
        </div>
        <div className="page-actions">
          <Link href="/projects/new" className="btn btn-ghost">
            Nuevo proyecto
          </Link>
          <Link href="/reports/new" className="btn btn-primary">
            Registrar jornada
          </Link>
        </div>
      </header>

      {dashboard.dataSource === "unavailable" ? (
        <p className="notice">
          No se pudo leer la base de datos. Revisa el archivo local y vuelve a
          cargar el parte.
        </p>
      ) : null}

      <KpiCards dashboard={dashboard} />
      <ProjectProgressList projects={dashboard.activeProjects} />
      <AlertFeed alerts={dashboard.alerts} />
    </>
  );
}
