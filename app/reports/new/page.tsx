import { ReportForm } from "@/components/reports/report-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listReportProjects } from "@/lib/reports";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevo reporte · OpsLeak",
};

export default async function NewReportPage() {
  const { projects, unavailable } = await listReportProjects();

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Reporte de campo</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Registra la jornada en texto libre. OpsLeak guarda las horas y los costos,
          y pide a Grok una alerta accionable.
        </p>
      </header>

      {unavailable ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No se pudieron cargar los proyectos. Revisa la conexión a PostgreSQL antes
          de registrar una jornada.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Jornada</CardTitle>
          <CardDescription>
            Proyecto, notas informales, horas invertidas y costos del día.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm projects={projects} />
        </CardContent>
      </Card>
    </>
  );
}
