import Link from "next/link";
import { Lightbulb, LayoutGrid, CalendarDays, Hourglass, ListChecks, Plus, CheckCircle2, Send, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser, getDashboardData, isWorkspaceEmpty } from "@/lib/dashboard";
import { formatShortDate, formatFullDate } from "@/lib/format";
import { loadDemoData, loadDemoTasks } from "./actions";
import { DashboardWidgets, type Widget } from "./DashboardWidgets";
import { TaskList } from "./TaskWidget";
import { TaskWidgetHeader } from "./TaskWidgetHeader";
import { AddTaskCategory } from "./AddTaskCategory";
import { WidgetTitle } from "./WidgetTitle";
import { Greeting } from "./Greeting";
import { WeekStrip } from "./WeekStrip";

function daysAgo(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function DashboardPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const { deadlines, awaitingDecision, counts } = await getDashboardData(workspace.id);
  const empty = await isWorkspaceEmpty(workspace.id);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id }, select: { name: true } });
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
                icon={<ListChecks size={15} strokeWidth={2} className="shrink-0 text-neutral-600" />}
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
          icon={<ListChecks size={16} strokeWidth={2} className="shrink-0 text-neutral-600" />}
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
      header: <WidgetTitle icon={LayoutGrid} seeAll="/opportunities">Applications</WidgetTitle>,
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
      id: "deadlines",
      header: <WidgetTitle icon={CalendarDays} seeAll="/opportunities">Schedule</WidgetTitle>,
      content: (
        <div>
          <WeekStrip markedDays={deadlines.map((d) => d.date.toISOString().slice(0, 10))} />
          {deadlines.length === 0 ? (
            <p className="border-t border-neutral-100 pt-3 text-sm text-neutral-500">Nothing due in the next 30 days.</p>
          ) : (
            <ul className="border-t border-neutral-100">
              {deadlines.map((d) => (
                <li key={d.id} className="flex items-stretch gap-3 border-b border-neutral-100 py-2.5 last:border-b-0">
                  <span
                    aria-hidden
                    className={`w-1 shrink-0 rounded-full ${d.kind === "opportunity" ? "bg-emerald-400" : "bg-blue-500"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-medium text-neutral-900">{d.title}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {d.kind === "opportunity" ? "Opportunity" : "Milestone"}
                      {d.meta ? ` · ${d.meta}` : ""}
                    </p>
                  </div>
                  <span className="pill tag-gray h-fit shrink-0">{formatShortDate(d.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: "awaiting",
      header: <WidgetTitle icon={Hourglass} seeAll="/opportunities">Awaiting a decision</WidgetTitle>,
      content:
        awaitingDecision.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing waiting on a response.</p>
        ) : (
          <div>
            <div className="table-head">
              <span>Application</span>
              <span>Waiting</span>
            </div>
            <ul className="divide-y divide-neutral-100">
              {awaitingDecision.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/applications/${a.id}`} className="min-w-0 text-sm text-neutral-900 hover:underline">
                    {a.opportunity.name}
                  </Link>
                  <span className="pill tag-yellow shrink-0">
                    {a.submittedAt ? `${daysAgo(a.submittedAt)}d` : "Not submitted"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <Greeting name={user?.name ?? null} />
        <div className="flex flex-wrap items-center gap-2">
          <AddTaskCategory />
          <Link href="/opportunities" className="btn-primary">
            <Plus size={15} strokeWidth={2.2} /> New opportunity
          </Link>
        </div>
      </div>

      <dl className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white px-5 py-3 shadow-[0_0_0_1px_rgba(55,53,47,0.08)] sm:w-fit sm:rounded-full">
        {(
          [
            [Send, counts.submitted, "Submitted"],
            [CheckCircle2, counts.accepted, "Accepted"],
            [Clock, counts.pending, "Pending"],
            [ListChecks, tasks.filter((t) => !t.done).length, "Open tasks"],
          ] as const
        ).map(([Icon, value, label]) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={16} strokeWidth={2} className="text-neutral-500" aria-hidden />
            <dd className="text-lg font-semibold text-neutral-900 tabular-nums">{value}</dd>
            <dt className="text-sm text-neutral-600">{label}</dt>
          </div>
        ))}
      </dl>

      {empty && (
        <div className="callout mb-8">
          <Lightbulb size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-neutral-500" />
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="text-sm text-neutral-700">
              <p className="font-medium text-neutral-900">Welcome. You&apos;re testing an early version.</p>
              <p className="mt-1">
                Track grants, residencies and open calls, the projects you apply with, and the people you follow up
                with. Load the example practice to look around, or start from scratch. Try pasting a link on
                Opportunities, or drag and resize the widgets below.
              </p>
              <p className="mt-1 text-neutral-500">
                Something confusing or broken? Use &quot;Send feedback&quot; in the sidebar. Data may be reset during
                testing.
              </p>
            </div>
            <form action={loadDemoData}>
              <button
                type="submit"
                className="shrink-0 whitespace-nowrap rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Load example data
              </button>
            </form>
          </div>
        </div>
      )}

      <DashboardWidgets widgets={widgets} />
    </main>
    </div>
  );
}
