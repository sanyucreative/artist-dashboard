"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";

export type SearchResult = {
  kind: "opportunity" | "project" | "task" | "asset";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const PER_KIND = 5;

// Searches this workspace only (opportunities, projects, tasks, assets). Case-insensitive substring match on the
// fields a person would actually remember an item by.
export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];

  const session = await auth();
  if (!session?.user?.id) return [];
  const workspace = await getWorkspaceForUser(session.user.id);
  const has = (field: string) => ({ [field]: { contains: q, mode: "insensitive" as const } });

  const [opportunities, projects, tasks, assets] = await Promise.all([
    prisma.opportunity.findMany({
      where: { workspaceId: workspace.id, OR: [has("name"), has("organization"), has("discipline")] },
      select: { id: true, name: true, organization: true, type: true },
      orderBy: { deadline: "asc" },
      take: PER_KIND,
    }),
    prisma.project.findMany({
      where: { workspaceId: workspace.id, OR: [has("title"), has("workingTitle"), has("medium"), has("description")] },
      select: { id: true, title: true, medium: true },
      take: PER_KIND,
    }),
    prisma.task.findMany({
      where: { workspaceId: workspace.id, ...has("title") },
      select: { id: true, title: true, done: true, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_KIND,
    }),
    prisma.asset.findMany({
      where: { workspaceId: workspace.id, OR: [has("title"), has("notes"), has("version")] },
      select: { id: true, title: true, type: true, project: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_KIND,
    }),
  ]);

  const enc = encodeURIComponent;
  return [
    ...opportunities.map((o) => ({
      kind: "opportunity" as const,
      id: o.id,
      title: o.name,
      subtitle: [o.organization, o.type.replace(/_/g, " ")].filter(Boolean).join(" · "),
      href: `/opportunities?q=${enc(o.name)}`,
    })),
    ...projects.map((p) => ({
      kind: "project" as const,
      id: p.id,
      title: p.title,
      subtitle: p.medium ?? "Project",
      href: `/projects/${p.id}`,
    })),
    ...tasks.map((t) => ({
      kind: "task" as const,
      id: t.id,
      title: t.title,
      subtitle: [t.category?.name, t.done ? "Done" : "To do"].filter(Boolean).join(" · "),
      href: "/dashboard",
    })),
    ...assets.map((a) => ({
      kind: "asset" as const,
      id: a.id,
      title: a.title,
      subtitle: [a.type.replace(/_/g, " "), a.project?.title].filter(Boolean).join(" · "),
      href: `/assets?q=${enc(a.title)}`,
    })),
  ];
}
