import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDemoData } from "../src/lib/demo-data";

const connectionString = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("No database connection string found -- run this via `netlify dev`, or set DATABASE_URL.");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "artist@example.com" },
    update: {},
    create: {
      email: "artist@example.com",
      name: "Jordan Ellis",
      disciplines: JSON.stringify(["visual art", "photography"]),
      timezone: "America/Chicago",
    },
  });

  // Signing in for the first time auto-creates an empty "My practice"
  // workspace (see getWorkspaceForUser) -- reuse it instead of creating a
  // second workspace the dashboard would never show (it always picks the
  // first one), which is what happened the first time this ran in production.
  const existingWorkspace = await prisma.workspace.findFirst({ where: { userId: user.id } });
  const workspace = existingWorkspace
    ? await prisma.workspace.update({
        where: { id: existingWorkspace.id },
        data: { name: "Jordan Ellis Studio", type: "art practice" },
      })
    : await prisma.workspace.create({
        data: {
          userId: user.id,
          name: "Jordan Ellis Studio",
          type: "art practice",
        },
      });

  await seedDemoData(workspace.id);

  console.log("Seed complete:", { user: user.email, workspace: workspace.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
