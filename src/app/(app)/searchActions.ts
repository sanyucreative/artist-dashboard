"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";

export type SearchResult = {
  kind: "opportunity" | "project" | "contact";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const PER_KIND = 5;

// Searches this workspace only. Case-insensitive substring match on the
// fields a person would actually remember an item by.
export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];

  const session = await auth();
  if (!session?.user?.id) return [];
  const workspace = await getWorkspaceForUser(session.user.id);
  const has = (field: string) => ({ [field]: { contains: q, mode: "insensitive" as const } });

  const [opportunities, projects, contacts] = await Promise.all([
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
    prisma.contact.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [has("name"), has("organization"), has("role"), has("email"), has("notes")],
      },
      select: { id: true, name: true, organization: true, role: true },
      orderBy: { name: "asc" },
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
    ...contacts.map((c) => ({
      kind: "contact" as const,
      id: c.id,
      title: c.name,
      subtitle: [c.role, c.organization].filter(Boolean).join(" · ") || "Contact",
      href: `/contacts?q=${enc(c.name)}`,
    })),
  ];
}
