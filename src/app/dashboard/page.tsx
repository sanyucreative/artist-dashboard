import { auth, signOut } from "@/auth";
import { getWorkspaceForUser, getDashboardData } from "@/lib/dashboard";

function daysAgo(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const { deadlines, awaitingDecision, counts } = await getDashboardData(workspace.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{workspace.name}</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-sm text-neutral-500 hover:text-neutral-900">Sign out</button>
        </form>
      </div>

      <section className="mb-8 grid grid-cols-4 gap-3">
        {(
          [
            ["Submitted", counts.submitted],
            ["Accepted", counts.accepted],
            ["Declined", counts.declined],
            ["Pending", counts.pending],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-lg border border-neutral-200 p-3">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="text-xl font-semibold text-neutral-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-700">Deadlines in the next 30 days</h2>
        {deadlines.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing due in the next 30 days.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {deadlines.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-3 py-2">
                <div>
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${
                      d.kind === "opportunity" ? "bg-blue-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm text-neutral-900">{d.title}</span>
                  {d.meta && <span className="ml-2 text-xs text-neutral-500">{d.meta}</span>}
                </div>
                <span className="ml-3 shrink-0 text-xs text-neutral-500">{formatDate(d.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">Awaiting a decision</h2>
        {awaitingDecision.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing waiting on a response.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {awaitingDecision.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-neutral-900">{a.opportunity.name}</span>
                <span className="text-xs text-neutral-500">
                  {a.submittedAt ? `${daysAgo(a.submittedAt)}d since submission` : "not yet submitted"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
