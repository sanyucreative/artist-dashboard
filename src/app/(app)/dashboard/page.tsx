import Link from "next/link";
import { LayoutDashboard, Lightbulb, LayoutGrid, Inbox, CalendarClock, Hourglass, ListChecks } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser, getDashboardData, isWorkspaceEmpty } from "@/lib/dashboard";
import { formatShortDate, formatFullDate } from "@/lib/format";
import { loadDemoData, loadDemoTasks } from "./actions";
import { DashboardWidgets, type Widget } from "./DashboardWidgets";
import { TaskList } from "./TaskWidget";
import { TaskWidgetHeader } from "./TaskWidgetHeader";
import { AddTaskCategory } from "./AddTaskCategory";

function daysAgo(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const { deadlines, awaitingDecision, counts, followUpsDue } = await getDashboardData(workspace.id);
  const empty = await isWorkspaceEmpty(workspace.id);
  const today = startOfToday();
  const tasks = await prisma.task.findMany({ where: { workspaceId: workspace.id }, orderBy: { position: "asc" } });
  const taskCategories = await prisma.taskCategory.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { position: "asc" },
  });

  // Uncategorized tasks (legacy rows, or a workspace that hasn't made a
  // category yet) show under a default "Tasks" widget so there's always
  // somewhere to add a task, without forcing every workspace to have a
  // TaskCategory row.
  const uncategorized = tasks.filter((t) => !t.categoryId);
  const noTasksAtAll = tasks.length === 0 && taskCategories.length === 0;
  const taskWidgets: Widget[] = [
    ...(uncategorized.length > 0 || taskCategories.length === 0
      ? [
          {
            id: "tasks",
            header: (
              <TaskWidgetHeader
                icon={<ListChecks size={15} strokeWidth={2} className="shrink-0 text-neutral-500" />}
                label="Tasks"
                categoryId={null}
              />
            ),
            content: noTasksAtAll ? (
              <div className="rounded-lg border border-neutral-200 px-3 py-3">
                <p className="mb-2 text-sm text-neutral-500">No tasks yet.</p>
                <form action={loadDemoTasks}>
                  <button type="submit" className="text-sm text-neutral-700 underline hover:text-neutral-900">
                    Load example tasks
                  </button>
                </form>
              </div>
            ) : (
              <TaskList tasks={uncategorized} />
            ),
          },
        ]
      : []),
    ...taskCategories.map((cat) => ({
      id: `taskcat-${cat.id}`,
      header: (
        <TaskWidgetHeader
          icon={<ListChecks size={15} strokeWidth={2} className="shrink-0 text-neutral-500" />}
          label={cat.name}
          categoryId={cat.id}
        />
      ),
      content: <TaskList tasks={tasks.filter((t) => t.categoryId === cat.id)} />,
    })),
  ];

  const widgets: Widget[] = [
    ...taskWidgets,
    {
      id: "stats",
      header: (
        <>
          <LayoutGrid size={15} strokeWidth={2} className="text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-700">Overview</h2>
        </>
      ),
      content: (
        <div className="grid grid-cols-4 gap-3">
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
        </div>
      ),
    },
    {
      id: "followups",
      header: (
        <>
          <Inbox size={15} strokeWidth={2} className="text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-700">Follow-ups due</h2>
        </>
      ),
      content:
        followUpsDue.length === 0 ? (
          <p className="text-sm text-neutral-500">No follow-ups due.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {followUpsDue.map((c) => {
              const overdue = c.nextFollowUpDate! < today;
              return (
                <li key={c.id} className="flex items-center justify-between px-3 py-2 hover:bg-black/[.02]">
                  <Link href="/contacts" className="text-sm text-neutral-900 hover:underline">
                    {c.name}
                  </Link>
                  {c.followUpNote && <span className="flex-1 px-2 text-xs text-neutral-500">{c.followUpNote}</span>}
                  <span className={`shrink-0 text-xs ${overdue ? "text-amber-700" : "text-neutral-500"}`}>
                    {formatFullDate(c.nextFollowUpDate!)}
                  </span>
                </li>
              );
            })}
          </ul>
        ),
    },
    {
      id: "deadlines",
      header: (
        <>
          <CalendarClock size={15} strokeWidth={2} className="text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-700">Deadlines in the next 30 days</h2>
        </>
      ),
      content:
        deadlines.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing due in the next 30 days.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {deadlines.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-3 py-2 hover:bg-black/[.02]">
                <div>
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${
                      d.kind === "opportunity" ? "bg-blue-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm text-neutral-900">{d.title}</span>
                  {d.meta && <span className="ml-2 text-xs text-neutral-500">{d.meta}</span>}
                </div>
                <span className="ml-3 shrink-0 text-xs text-neutral-500">{formatShortDate(d.date)}</span>
              </li>
            ))}
          </ul>
        ),
    },
    {
      id: "awaiting",
      header: (
        <>
          <Hourglass size={15} strokeWidth={2} className="text-neutral-500" />
          <h2 className="text-sm font-medium text-neutral-700">Awaiting a decision</h2>
        </>
      ),
      content:
        awaitingDecision.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing waiting on a response.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {awaitingDecision.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-black/[.02]">
                <Link href={`/applications/${a.id}`} className="text-sm text-neutral-900 hover:underline">
                  {a.opportunity.name}
                </Link>
                <span className="text-xs text-neutral-500">
                  {a.submittedAt ? `${daysAgo(a.submittedAt)}d since submission` : "not yet submitted"}
                </span>
              </li>
            ))}
          </ul>
        ),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-[28px] font-semibold tracking-tight text-neutral-900">
          <LayoutDashboard size={26} strokeWidth={2} /> Dashboard
        </h1>
        <AddTaskCategory />
      </div>

      {empty && (
        <div className="callout mb-8">
          <Lightbulb size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-neutral-500" />
          <div className="flex flex-1 items-center justify-between gap-4">
            <p className="text-sm text-neutral-700">
              Nothing here yet. Load an example practice to see how projects, opportunities, and applications fit
              together.
            </p>
            <form action={loadDemoData}>
              <button
                type="submit"
                className="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Load example data
              </button>
            </form>
          </div>
        </div>
      )}

      <DashboardWidgets widgets={widgets} />
    </main>
  );
}
