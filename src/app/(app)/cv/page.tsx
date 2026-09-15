import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { CV_CATEGORIES, titleCase } from "@/lib/constants";
import { CVEntryRow, type CVEntryData } from "./CVEntryRow";
import { NewCVEntryForm } from "./NewCVEntryForm";

export default async function CVPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);

  const entries = await prisma.cVEntry.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { date: "desc" },
  });

  const grouped = CV_CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((e) => e.category === category),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">CV</h1>
        <div className="flex items-center gap-3">
          <a href="/cv/export/text" className="text-sm text-neutral-500 hover:text-neutral-900">
            Export as text
          </a>
          <a href="/cv/export/pdf" className="text-sm text-neutral-500 hover:text-neutral-900">
            Export as PDF
          </a>
        </div>
      </div>
      <p className="mb-6 text-xs text-neutral-500">
        Auto-populated from accepted applications and exhibition records. Uncheck &quot;Include in exports&quot; on an
        entry to keep it here without it appearing in your CV export.
      </p>

      <div className="mb-6">
        <NewCVEntryForm />
      </div>

      {grouped.every((g) => g.entries.length === 0) ? (
        <p className="text-sm text-neutral-500">Nothing on your CV yet.</p>
      ) : (
        <div className="space-y-6">
          {grouped
            .filter((g) => g.entries.length > 0)
            .map((g) => (
              <section key={g.category}>
                <h2 className="mb-2 text-sm font-medium text-neutral-700">{titleCase(g.category)}</h2>
                <ul className="space-y-2">
                  {g.entries.map((e) => (
                    <CVEntryRow key={e.id} entry={e as CVEntryData} />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </main>
  );
}
