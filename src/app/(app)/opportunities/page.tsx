import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { OPPORTUNITY_TYPES, titleCase } from "@/lib/constants";
import { OpportunityRow } from "./OpportunityRow";
import { NewOpportunityForm } from "./NewOpportunityForm";
import { CsvImportForm } from "./CsvImportForm";
import type { Prisma } from "@/generated/prisma/client";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);

  const discipline = typeof params.discipline === "string" ? params.discipline : "";
  const type = typeof params.type === "string" ? params.type : "all";
  const deadlineFrom = typeof params.from === "string" ? params.from : "";
  const deadlineTo = typeof params.to === "string" ? params.to : "";
  const fee = typeof params.fee === "string" ? params.fee : "any";
  const applied = typeof params.applied === "string" ? params.applied : "any";

  const where: Prisma.OpportunityWhereInput = { workspaceId: workspace.id };
  if (discipline) where.discipline = { contains: discipline };
  if (type !== "all") where.type = type;
  if (deadlineFrom || deadlineTo) {
    where.deadline = {
      ...(deadlineFrom ? { gte: new Date(deadlineFrom) } : {}),
      ...(deadlineTo ? { lte: new Date(deadlineTo) } : {}),
    };
  }
  if (fee === "free") where.OR = [{ feeAmount: null }, { feeAmount: 0 }];
  if (fee === "paid") where.feeAmount = { gt: 0 };
  if (applied === "yes") where.applications = { some: {} };
  if (applied === "no") where.applications = { none: {} };

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      applications: { select: { id: true, status: true, submittedAt: true } },
      eligibilityCriteria: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { deadline: "asc" },
  });

  const selectClass = "rounded-md border border-neutral-300 px-2 py-1 text-xs";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-2xl font-semibold text-neutral-900">Opportunities</h1>
      <div className="mb-6 flex flex-wrap items-start justify-end gap-3">
        <CsvImportForm />
        <NewOpportunityForm />
      </div>

      <form className="mb-6 flex flex-wrap items-center gap-2" method="get">
        <input
          name="discipline"
          defaultValue={discipline}
          placeholder="Discipline"
          className={selectClass}
        />
        <select name="type" defaultValue={type} className={selectClass}>
          <option value="all">All types</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {titleCase(t)}
            </option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={deadlineFrom} className={selectClass} />
        <span className="text-xs text-neutral-400">to</span>
        <input type="date" name="to" defaultValue={deadlineTo} className={selectClass} />
        <select name="fee" defaultValue={fee} className={selectClass}>
          <option value="any">Any fee</option>
          <option value="free">Free</option>
          <option value="paid">Has fee</option>
        </select>
        <select name="applied" defaultValue={applied} className={selectClass}>
          <option value="any">Applied: any</option>
          <option value="yes">Applied: yes</option>
          <option value="no">Applied: no</option>
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs text-white">
          Filter
        </button>
        <a href="/opportunities" className="text-xs text-neutral-400 hover:text-neutral-600">
          Clear
        </a>
      </form>

      {opportunities.length === 0 ? (
        <p className="text-sm text-neutral-500">No opportunities match this filter.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {opportunities.map((o) => (
            <OpportunityRow key={o.id} opportunity={o} />
          ))}
        </ul>
      )}
    </main>
  );
}
