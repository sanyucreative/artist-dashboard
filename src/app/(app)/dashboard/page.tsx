import Link from "next/link";
import { LayoutDashboard, Lightbulb, LayoutGrid, Inbox, CalendarClock, Hourglass, ListChecks, Target, Flag } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser, getDashboardData, isWorkspaceEmpty } from "@/lib/dashboard";
import { formatShortDate, formatFullDate } from "@/lib/format";
import { loadDemoData, loadDemoTasks } from "./actions";
import { DashboardWidgets, type Widget } from "./DashboardWidgets";
import { TaskList } from "./TaskWidget";
import { TaskWidgetHeader } from "./TaskWidgetHeader";
import { AddTaskCategory } from "./AddTaskCategory";

function WidgetTitle({ icon: Icon, children }: { icon: typeof Inbox; children: React.ReactNode }) {
  return (
    <div className="flex min-h-7 min-w-0 flex-1 items-center gap-2">
      <Icon size={15} strokeWidth={2} className="shrink-0 text-neutral-500" />
      <h2 className="min-w-0 truncate text-sm font-medium text-neutral-700">{children}</h2>
    </div>
  );
}

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
              <div>
                <p className="mb-2 text-sm text-neutral-500">No tasks yet.</p>
                <form action={loadDemoTasks}>
                  <button type="submit" className="rounded text-sm font-medium text-neutral-800 underline underline-offset-2 hover:text-neutral-900">
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
      header: <WidgetTitle icon={LayoutGrid}>Applications</WidgetTitle>,
      content: (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          {(
            [
              ["Submitted", counts.submitted],
              ["Accepted", counts.accepted],
              ["Declined", counts.declined],
              ["Pending", counts.pending],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-neutral-500">{label}</dt>
              <dd className="text-2xl leading-tight font-semibold text-neutral-900">{value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      id: "followups",
      header: <WidgetTitle icon={Inbox}>Follow-ups due</WidgetTitle>,
      content:
        followUpsDue.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing to follow up on. Set a date on a contact to see it here.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {followUpsDue.map((c) => {
              const overdue = c.nextFollowUpDate! < today;
              return (
                <li key={c.id} className="flex items-baseline justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <Link href="/contacts" className="text-sm text-neutral-900 hover:underline">
                      {c.name}
                    </Link>
                    {c.followUpNote && <p className="truncate text-xs text-neutral-500">{c.followUpNote}</p>}
                  </div>
                  <span className={`shrink-0 text-xs ${overdue ? "font-medium text-amber-800" : "text-neutral-500"}`}>
                    {overdue ? "Overdue " : ""}
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
      header: <WidgetTitle icon={CalendarClock}>Upcoming deadlines</WidgetTitle>,
      content:
        deadlines.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing due in the next 30 days.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {deadlines.map((d) => {
              const Icon = d.kind === "opportunity" ? Target : Flag;
              return (
                <li key={d.id} className="flex items-start justify-between gap-3 py-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <Icon
                      size={14}
                      strokeWidth={2}
                      aria-label={d.kind === "opportunity" ? "Opportunity" : "Milestone"}
                      className="mt-0.5 shrink-0 text-neutral-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-neutral-900">{d.title}</p>
                      {d.meta && <p className="truncate text-xs text-neutral-500">{d.meta}</p>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-neutral-500">{formatShortDate(d.date)}</span>
                </li>
              );
            })}
          </ul>
        ),
    },
    {
      id: "awaiting",
      header: <WidgetTitle icon={Hourglass}>Awaiting a decision</WidgetTitle>,
      content:
        awaitingDecision.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing waiting on a response.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {awaitingDecision.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-3 py-2">
                <Link href={`/applications/${a.id}`} className="min-w-0 text-sm text-neutral-900 hover:underline">
                  {a.opportunity.name}
                </Link>
                <span className="shrink-0 text-xs text-neutral-500">
                  {a.submittedAt ? `${daysAgo(a.submittedAt)}d waiting` : "not submitted"}
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
