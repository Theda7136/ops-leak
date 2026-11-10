import "server-only";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const projectSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  clientName: z.string().min(2, "El cliente es obligatorio."),
  totalBudget: z.coerce.number().positive("El presupuesto debe ser mayor a 0."),
});

async function createProjectAction(formData: FormData) {
  "use server";

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    clientName: formData.get("clientName"),
    totalBudget: formData.get("totalBudget"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message);
  }

  await prisma.project.create({
    data: {
      name: parsed.data.name,
      clientName: parsed.data.clientName,
      totalBudget: parsed.data.totalBudget,
      status: "ACTIVE",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/reports/new");
  redirect("/dashboard");
}

export default function NewProjectPage() {
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Proyecto</CardTitle>
          <CardDescription>Registra una nueva obra o proyecto para control operativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProjectAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Proyecto</label>
              <Input name="name" placeholder="Ej. Torre Residencial Sur" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente / Empresa</label>
              <Input name="clientName" placeholder="Ej. Constructora Andina" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Presupuesto Inicial ($)</label>
              <Input name="totalBudget" type="number" step="0.01" placeholder="50000" required />
            </div>
            <Button type="submit" className="w-full">Guardar Proyecto</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}