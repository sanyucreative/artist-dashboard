import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getWorkspaceForUser(userId: string) {
  // v1 has no workspace switcher UI yet -- use the user's first workspace,
  // creating a default one on first login so the dashboard never has
  // nowhere to point.
  const existing = await prisma.workspace.findFirst({ where: { userId } });
  if (existing) return existing;
  return prisma.workspace.create({ data: { userId, name: "My practice" } });
}

export async function isWorkspaceEmpty(workspaceId: string) {
  const [projectCount, opportunityCount] = await Promise.all([
    prisma.project.count({ where: { workspaceId } }),
    prisma.opportunity.count({ where: { workspaceId } }),
  ]);
  return projectCount === 0 && opportunityCount === 0;
}

export async function getDashboardData(workspaceId: string) {
  const now = new Date();
  const in30Days = new Date(now.getTime() + THIRTY_DAYS_MS);

  const [opportunities, milestones, awaitingDecision, statusCounts] = await Promise.all([
    prisma.opportunity.findMany({
      where: { workspaceId, deadline: { gte: now, lte: in30Days } },
      orderBy: { deadline: "asc" },
    }),
    prisma.milestone.findMany({
      where: { project: { workspaceId }, dueDate: { gte: now, lte: in30Days } },
      include: { project: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.application.findMany({
      where: { workspaceId, status: { in: ["submitted", "under_review"] } },
      include: { opportunity: true },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { workspaceId },
      _count: true,
    }),
  ]);

  const deadlines = [
    ...opportunities.map((o) => ({
      id: `opp-${o.id}`,
      kind: "opportunity" as const,
      title: o.name,
      date: o.deadline!,
      meta: o.organization,
    })),
    ...milestones.map((m) => ({
      id: `mile-${m.id}`,
      kind: "milestone" as const,
      title: `${m.project.title}: ${m.title}`,
      date: m.dueDate!,
      meta: null,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const counts = {
    submitted: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
  };
  for (const row of statusCounts) {
    if (row.status === "submitted" || row.status === "under_review") counts.pending += row._count;
    if (row.status === "decision") {
      // outcome-level breakdown needs a second pass since groupBy above is by status only
    }
  }
  const decided = await prisma.application.findMany({
    where: { workspaceId, status: "decision" },
    select: { outcome: true },
  });
  for (const d of decided) {
    if (d.outcome === "accepted") counts.accepted++;
    else if (d.outcome === "declined") counts.declined++;
  }
  counts.submitted = await prisma.application.count({ where: { workspaceId, submittedAt: { not: null } } });

  return { deadlines, awaitingDecision, counts };
}
