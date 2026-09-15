import Link from "next/link";
import { auth } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { getInsightsData } from "@/lib/insights";
import { OUTCOME_REASON_LABELS, titleCase } from "@/lib/constants";
import { formatFullDate } from "@/lib/format";

function Bar({ pct, className = "bg-neutral-900" }: { pct: number; className?: string }) {
  return (
    <div className="h-2 w-full rounded bg-neutral-100">
      <div className={`h-2 rounded ${className}`} style={{ width: `${Math.round(pct * 100)}%` }} />
    </div>
  );
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default async function InsightsPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const data = await getInsightsData(workspace.id);

  const maxMonthly = Math.max(1, ...data.monthlyRows.map(([, v]) => v.submitted));
  const maxReason = Math.max(1, ...data.reasonCounts.map(([, n]) => n));

  const reapplyNow = data.reapplyEligible.filter((a) => !a.reapplyDate || a.reapplyDate <= new Date());
  const reapplyLater = data.reapplyEligible.filter((a) => a.reapplyDate && a.reapplyDate > new Date());

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Insights</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Acceptance rate</h2>
        {data.decidedCount === 0 ? (
          <p className="text-sm text-neutral-500">No decided applications yet.</p>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xl font-semibold text-neutral-900">
                {Math.round((data.overallRate ?? 0) * 100)}%
              </span>
              <span className="text-xs text-neutral-500">
                overall, across {data.decidedCount} decided application{data.decidedCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-2">
              {data.byType.map((t) => (
                <div key={t.type}>
                  <div className="mb-1 flex items-center justify-between text-xs text-neutral-600">
                    <span>{titleCase(t.type)}</span>
                    <span>
                      {t.accepted}/{t.total} ({Math.round(t.rate * 100)}%)
                    </span>
                  </div>
                  <Bar pct={t.rate} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Rejection reasons</h2>
        {data.reasonCounts.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing declined yet.</p>
        ) : (
          <div className="space-y-2">
            {data.reasonCounts.map(([code, count]) => (
              <div key={code}>
                <div className="mb-1 flex items-center justify-between text-xs text-neutral-600">
                  <span>{OUTCOME_REASON_LABELS[code] ?? titleCase(code)}</span>
                  <span>{count}</span>
                </div>
                <Bar pct={count / maxReason} className="bg-red-500" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Applications per month vs. acceptances</h2>
        {data.monthlyRows.length === 0 ? (
          <p className="text-sm text-neutral-500">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {data.monthlyRows.map(([key, v]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-xs text-neutral-500">{monthLabel(key)}</span>
                <div className="relative h-3 flex-1 rounded bg-neutral-100">
                  <div
                    className="absolute h-3 rounded bg-neutral-300"
                    style={{ width: `${(v.submitted / maxMonthly) * 100}%` }}
                  />
                  <div
                    className="absolute h-3 rounded bg-green-500"
                    style={{ width: `${(v.accepted / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-neutral-500">
                  {v.accepted}/{v.submitted}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Reapply-eligible opportunities</h2>
        {data.reapplyEligible.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing marked reapply-eligible yet.</p>
        ) : (
          <div className="space-y-4">
            {reapplyNow.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-neutral-500">Eligible now</p>
                <ul className="space-y-1">
                  {reapplyNow.map((a) => (
                    <li key={a.id}>
                      <Link href={`/applications/${a.id}`} className="text-sm text-blue-700 hover:underline">
                        {a.opportunity.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {reapplyLater.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-neutral-500">Upcoming</p>
                <ul className="space-y-1">
                  {reapplyLater.map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <Link href={`/applications/${a.id}`} className="text-sm text-blue-700 hover:underline">
                        {a.opportunity.name}
                      </Link>
                      <span className="text-xs text-neutral-500">
                        {a.reapplyDate && formatFullDate(a.reapplyDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
