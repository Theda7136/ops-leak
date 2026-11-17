import { AccessForm } from "@/components/access/access-form";

export const metadata = {
  title: "Acceso · OpsLeak",
};

export default function LoginPage() {
  return (
    <div className="form-panel">
      <header>
        <p className="kicker">Acceso</p>
        <h1>OpsLeak</h1>
        <p className="lede">
          La consola queda cerrada cuando hay una clave configurada.
        </p>
      </header>
      <AccessForm />
    </div>
  );
}
