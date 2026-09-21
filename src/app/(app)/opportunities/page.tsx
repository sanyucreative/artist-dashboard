import { auth } from "@/auth";
import { Target } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { OPPORTUNITY_TYPES, titleCase } from "@/lib/constants";
import { OpportunityRow } from "./OpportunityRow";
import { SearchClear } from "../SearchClear";
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

  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const where: Prisma.OpportunityWhereInput = { workspaceId: workspace.id };
  if (q) {
    where.AND = [
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { organization: { contains: q, mode: "insensitive" } },
          { discipline: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }
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

  const selectClass = "rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader title="Opportunities" icon={Target}>
        <CsvImportForm />
        <NewOpportunityForm />
      </PageHeader>

      {q && <SearchClear q={q} href="/opportunities" />}

      <form className="mb-6 flex flex-wrap items-start gap-2" method="get">
        <input
          name="discipline"
          defaultValue={discipline}
          placeholder="Discipline"
          aria-label="Discipline"
          className={selectClass}
        />
        <select name="type" defaultValue={type} className={selectClass} aria-label="Opportunity type">
          <option value="all">All types</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {titleCase(t)}
            </option>
          ))}
        </select>
        <select name="applied" defaultValue={applied} className={selectClass} aria-label="Applied status">
          <option value="any">Applied: any</option>
          <option value="yes">Applied: yes</option>
          <option value="no">Applied: no</option>
        </select>
        <details className="group" open={Boolean(deadlineFrom || deadlineTo || fee !== "any")}>
          <summary className="btn-secondary cursor-pointer list-none">More filters</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input type="date" name="from" defaultValue={deadlineFrom} className={selectClass} aria-label="Deadline from" />
            <span className="text-sm text-neutral-500">to</span>
            <input type="date" name="to" defaultValue={deadlineTo} className={selectClass} aria-label="Deadline to" />
            <select name="fee" defaultValue={fee} className={selectClass} aria-label="Application fee">
              <option value="any">Any fee</option>
              <option value="free">Free</option>
              <option value="paid">Has fee</option>
            </select>
          </div>
        </details>
        <button type="submit" className="btn-primary btn-sm">
          Apply filters
        </button>
        <a href="/opportunities" className="self-center text-sm text-neutral-500 hover:text-neutral-800">
          Clear
        </a>
      </form>

      {opportunities.length === 0 ? (
        <p className="text-sm text-neutral-500">No opportunities match. Clear the filters, or add one with the button above.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
          {opportunities.map((o) => (
            <OpportunityRow key={o.id} opportunity={o} />
          ))}
        </ul>
      )}
    </main>
  );
}
