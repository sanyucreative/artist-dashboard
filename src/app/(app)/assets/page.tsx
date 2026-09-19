import { auth } from "@/auth";
import { PageHeader } from "../PageHeader";
import { FolderOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { VISUAL_ASSET_TYPES, VERSIONED_ASSET_TYPES } from "@/lib/constants";
import { NewAssetForm } from "./NewAssetForm";
import { AssetCard, type AssetCardData } from "./AssetCard";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const projectFilter = typeof params.project === "string" ? params.project : "all";

  const [projects, assets] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId: workspace.id }, orderBy: { title: "asc" } }),
    prisma.asset.findMany({
      where: {
        workspaceId: workspace.id,
        ...(projectFilter !== "all" ? { projectId: projectFilter } : {}),
      },
      include: {
        project: { select: { title: true } },
        usedIn: { include: { application: { include: { opportunity: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const visual = assets.filter((a) => VISUAL_ASSET_TYPES.has(a.type));
  const documents = assets.filter((a) => !VISUAL_ASSET_TYPES.has(a.type));

  // Group versioned document types (statements, bios) by title so every
  // version of the "same" asset shows together, per spec.
  const versionedGroups = new Map<string, typeof documents>();
  const plainDocuments: typeof documents = [];
  for (const a of documents) {
    if (!VERSIONED_ASSET_TYPES.has(a.type)) {
      plainDocuments.push(a);
      continue;
    }
    const key = `${a.type}:${a.title}`;
    if (!versionedGroups.has(key)) versionedGroups.set(key, []);
    versionedGroups.get(key)!.push(a);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader title="Asset library" icon={FolderOpen}>
        <NewAssetForm projects={projects} />
      </PageHeader>

      <form className="mb-8 flex items-center gap-2" method="get">
        <select
          name="project"
          defaultValue={projectFilter}
          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm" aria-label="Filter by project"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary btn-sm">
          Filter
        </button>
      </form>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Images and work samples</h2>
        {visual.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visual.map((a) => (
              <AssetCard key={a.id} asset={a as AssetCardData} projects={projects} variant="grid" />
            ))}
          </div>
        )}
      </section>

      {versionedGroups.size > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-medium text-neutral-700">Statements &amp; bios</h2>
          <div className="space-y-3">
            {[...versionedGroups.entries()].map(([key, versions]) => {
              const [latest, ...older] = versions;
              return (
                <div key={key}>
                  <AssetCard asset={latest as AssetCardData} projects={projects} />
                  {older.length > 0 && (
                    <details className="ml-3 mt-1">
                      <summary className="cursor-pointer text-xs text-neutral-500">
                        {older.length} earlier version{older.length === 1 ? "" : "s"}
                      </summary>
                      <div className="mt-2 space-y-2">
                        {older.map((a) => (
                          <AssetCard key={a.id} asset={a as AssetCardData} projects={projects} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Other documents</h2>
        {plainDocuments.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing here yet.</p>
        ) : (
          <div className="space-y-2">
            {plainDocuments.map((a) => (
              <AssetCard key={a.id} asset={a as AssetCardData} projects={projects} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
