import { ProjectForm } from "@/components/projects/project-form";

export const metadata = {
  title: "Nuevo proyecto · OpsLeak",
};

export default function NewProjectPage() {
  return (
    <div className="form-panel">
      <header>
        <p className="kicker">Alta</p>
        <h1>Nuevo proyecto</h1>
        <p className="lede">
          Nombre, cliente, presupuesto y fechas. La obra queda activa para las jornadas.
        </p>
      </header>
      <ProjectForm />
    </div>
  );
}
