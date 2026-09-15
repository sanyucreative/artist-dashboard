import { prisma } from "@/lib/prisma";

const DECIDED_OUTCOMES = ["accepted", "declined", "ineligible", "withdrawn", "waitlisted", "no_response"];

export async function getInsightsData(workspaceId: string) {
  const applications = await prisma.application.findMany({
    where: { workspaceId },
    include: { opportunity: { select: { type: true, name: true } } },
  });

  const decided = applications.filter((a) => a.outcome && DECIDED_OUTCOMES.includes(a.outcome));
  const accepted = decided.filter((a) => a.outcome === "accepted");
  const overallRate = decided.length ? accepted.length / decided.length : null;

  const byType = new Map<string, { total: number; accepted: number }>();
  for (const a of decided) {
    const key = a.opportunity.type;
    if (!byType.has(key)) byType.set(key, { total: 0, accepted: 0 });
    const bucket = byType.get(key)!;
    bucket.total++;
    if (a.outcome === "accepted") bucket.accepted++;
  }

  const reasonCounts = new Map<string, number>();
  for (const a of decided) {
    if (a.outcome === "accepted") continue;
    const code = a.outcomeReasonCode ?? "no_reason_given";
    reasonCounts.set(code, (reasonCounts.get(code) ?? 0) + 1);
  }

  // Applications per month (by submittedAt) vs. acceptances (by decisionAt,
  // attributed to the month it was submitted so effort and outcome line up
  // in the same row).
  const monthly = new Map<string, { submitted: number; accepted: number }>();
  for (const a of applications) {
    if (!a.submittedAt) continue;
    const key = `${a.submittedAt.getFullYear()}-${String(a.submittedAt.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly.has(key)) monthly.set(key, { submitted: 0, accepted: 0 });
    const bucket = monthly.get(key)!;
    bucket.submitted++;
    if (a.outcome === "accepted") bucket.accepted++;
  }
  const monthlyRows = [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b));

  const reapplyEligible = await prisma.application.findMany({
    where: { workspaceId, canReapply: true },
    include: { opportunity: { select: { name: true } } },
    orderBy: { reapplyDate: "asc" },
  });

  return {
    totalApplications: applications.length,
    decidedCount: decided.length,
    overallRate,
    byType: [...byType.entries()].map(([type, v]) => ({ type, ...v, rate: v.total ? v.accepted / v.total : 0 })),
    reasonCounts: [...reasonCounts.entries()].sort(([, a], [, b]) => b - a),
    monthlyRows,
    reapplyEligible,
  };
}
