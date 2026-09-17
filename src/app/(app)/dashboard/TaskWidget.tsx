"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { toggleTask, deleteTask } from "./taskActions";

export type TaskData = { id: string; title: string; done: boolean };

// Just the checklist -- adding a task happens from the header (always
// visible, even when the widget's resized short), not down here.
export function TaskList({ tasks }: { tasks: TaskData[] }) {
  const [, startTransition] = useTransition();

  if (tasks.length === 0) {
    return <p className="rounded-lg border border-neutral-200 px-3 py-3 text-sm text-neutral-500">No tasks yet.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
      {tasks.map((t) => (
        <li key={t.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-black/[.02]">
          <input
            type="checkbox"
            checked={t.done}
            onChange={(e) => startTransition(() => toggleTask(t.id, e.target.checked))}
            className="h-4 w-4 shrink-0 accent-neutral-800"
          />
          <span className={`flex-1 text-sm ${t.done ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
            {t.title}
          </span>
          <button
            type="button"
            onClick={() => startTransition(() => deleteTask(t.id))}
            aria-label="Delete task"
            className="shrink-0 text-neutral-300 opacity-0 hover:text-neutral-600 group-hover:opacity-100"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </li>
      ))}
    </ul>
  );
}
