import { ReportForm } from "@/components/reports/report-form";
import { listReportProjects } from "@/lib/reports";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nueva jornada · OpsLeak",
};

export default async function NewReportPage() {
  const { projects, unavailable } = await listReportProjects();

  return (
    <div className="form-panel">
      <header>
        <p className="kicker">Campo</p>
        <h1>Nueva jornada</h1>
        <p className="lede">
          Escribe lo que pasó en obra. OpsLeak guarda horas y costos, y pide a Grok una acción.
        </p>
      </header>

      {unavailable ? (
        <p className="notice">
          No se pudieron cargar los proyectos. Revisa que la base local esté disponible.
        </p>
      ) : null}

      <ReportForm projects={projects} />
    </div>
  );
}
