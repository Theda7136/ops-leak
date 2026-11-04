import { PrismaClient, type ProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

const projects: Array<{
  name: string;
  clientName: string;
  totalBudget: number;
  startDate: Date;
  estimatedEndDate: Date;
  status: ProjectStatus;
}> = [
  {
    name: "Torre Residencial Norte",
    clientName: "Inmobiliaria Altura",
    totalBudget: 100000,
    startDate: new Date("2026-04-01T12:00:00.000Z"),
    estimatedEndDate: new Date("2027-02-28T12:00:00.000Z"),
    status: "ACTIVE",
  },
  {
    name: "Nave Industrial Pacífico",
    clientName: "Logística Pacífico",
    totalBudget: 240000,
    startDate: new Date("2026-01-15T12:00:00.000Z"),
    estimatedEndDate: new Date("2026-11-30T12:00:00.000Z"),
    status: "AT_RISK",
  },
];

async function main(): Promise<void> {
  try {
    for (const project of projects) {
      const existing = await prisma.project.findFirst({
        where: { name: project.name },
        select: { id: true },
      });

      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: project,
        });
        continue;
      }

      await prisma.project.create({ data: project });
    }
  } catch (error) {
    console.error("No se pudo sembrar la base de OpsLeak.", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
