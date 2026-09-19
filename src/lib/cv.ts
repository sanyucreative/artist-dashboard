import { prisma } from "@/lib/prisma";
import { CV_CATEGORIES } from "@/lib/constants";
import { dateYearUTC } from "@/lib/format";

export async function getCVData(workspaceId: string) {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: { user: { select: { name: true, email: true } } },
  });
  const entries = await prisma.cVEntry.findMany({
    where: { workspaceId, isPublic: true },
    orderBy: { date: "desc" },
  });

  const grouped = CV_CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((e) => e.category === category),
  })).filter((g) => g.entries.length > 0);

  return { workspace, grouped };
}

function formatEntryLine(e: { title: string; organization: string | null; location: string | null; date: Date | null }) {
  const bits = [e.organization, e.location].filter(Boolean).join(", ");
  const year = e.date ? dateYearUTC(e.date) : null;
  return [e.title, bits, year].filter(Boolean).join(" - ");
}

export function renderCVAsText(data: Awaited<ReturnType<typeof getCVData>>) {
  const name = data.workspace.user.name ?? data.workspace.name;
  const lines: string[] = [name, ""];
  for (const group of data.grouped) {
    lines.push(group.category.toUpperCase());
    for (const e of group.entries) {
      lines.push(`- ${formatEntryLine(e)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export { formatEntryLine };
