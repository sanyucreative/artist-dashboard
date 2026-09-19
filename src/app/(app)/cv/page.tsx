import { Award, BookOpen, Mic, Newspaper, Building2, Image as ImageIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { CV_CATEGORIES, titleCase } from "@/lib/constants";
import { CVEntryRow, type CVEntryData } from "./CVEntryRow";
import { NewCVEntryForm } from "./NewCVEntryForm";
import { ProfileHeader } from "./ProfileHeader";

const CATEGORY_ICONS: Record<string, typeof Award> = {
  exhibition: ImageIcon,
  award: Award,
  residency: Building2,
  publication: BookOpen,
  talk: Mic,
  press: Newspaper,
};

const CATEGORY_LABELS_PLURAL: Record<string, string> = {
  exhibition: "Exhibitions",
  award: "Awards",
  residency: "Residencies",
  publication: "Publications",
  talk: "Talks",
  press: "Press",
};

const CATEGORY_LABELS_SINGULAR: Record<string, string> = {
  exhibition: "Exhibition",
  award: "Award",
  residency: "Residency",
  publication: "Publication",
  talk: "Talk",
  press: "Press",
};

function parseDisciplines(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default async function CVPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  const entries = await prisma.cVEntry.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { date: "desc" },
  });

  const grouped = CV_CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((e) => e.category === category),
  })).filter((g) => g.entries.length > 0);

  const disciplines = user ? parseDisciplines(user.disciplines) : [];
  const initial = (user?.name ?? workspace.name ?? "?").charAt(0).toUpperCase();
  const earliestYear = entries.reduce<number | null>((min, e) => {
    if (!e.date) return min;
    const y = e.date.getUTCFullYear();
    return min === null || y < min ? y : min;
  }, null);
  const workspaceLabel = workspace.type ? `${workspace.name} · ${workspace.type}` : workspace.name;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      {/* Profile header -- the artist's own name and practice front and
          center, the way a LinkedIn profile leads with the person rather
          than a table of records. */}
      <ProfileHeader
        name={user?.name ?? null}
        disciplines={disciplines}
        initial={initial}
        workspaceLabel={workspaceLabel}
        stats={
          grouped.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-100 pt-4">
              {grouped.map((g) => (
                <div key={g.category} className="text-sm">
                  <span className="font-semibold text-neutral-900">{g.entries.length}</span>{" "}
                  <span className="text-neutral-500">{g.entries.length === 1
                      ? (CATEGORY_LABELS_SINGULAR[g.category] ?? titleCase(g.category))
                      : (CATEGORY_LABELS_PLURAL[g.category] ?? titleCase(g.category))}
                  </span>
                </div>
              ))}
              {earliestYear && (
                <div className="text-sm text-neutral-500">
                  Active since <span className="font-medium text-neutral-700">{earliestYear}</span>
                </div>
              )}
            </div>
          )
        }
      />

      <p className="mb-4 text-xs text-neutral-500">
        Auto-populated from accepted applications and exhibition records. Uncheck &quot;Include in exports&quot; on an
        entry to keep it here without it appearing in your CV export.
      </p>

      <div className="mb-6">
        <NewCVEntryForm />
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-neutral-500">Nothing on your profile yet.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((g) => {
            const Icon = CATEGORY_ICONS[g.category] ?? Award;
            return (
              <section key={g.category}>
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                  <Icon size={15} strokeWidth={2} className="text-neutral-500" />
                  {CATEGORY_LABELS_PLURAL[g.category] ?? titleCase(g.category)}
                </h2>
                <ul className="space-y-2">
                  {g.entries.map((e) => (
                    <CVEntryRow key={e.id} entry={e as CVEntryData} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
