"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { toggleTask, deleteTask } from "./taskActions";

export type TaskData = { id: string; title: string; done: boolean };

// Just the checklist. Adding a task happens from the header, which stays
// visible when the widget is resized short. Rows are plain, divided lines
// inside the widget card (no second bordered box), and the whole row label is
// the click target for the checkbox.
export function TaskList({ tasks }: { tasks: TaskData[] }) {
  const [, startTransition] = useTransition();

  if (tasks.length === 0) {
    return <p className="text-sm text-neutral-500">No tasks yet. Use the plus above to add one.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {tasks.map((t) => (
        <li key={t.id} className="group flex items-center gap-1 rounded-md hover:bg-black/[.03]">
          <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 py-2 pr-1 pl-1">
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) => startTransition(() => toggleTask(t.id, e.target.checked))}
              className="check mt-0.5"
            />
            <span
              className={`min-w-0 flex-1 text-sm leading-snug transition-colors duration-200 ${
                t.done ? "text-neutral-500 line-through decoration-neutral-400" : "text-neutral-900"
              }`}
            >
              {t.title}
            </span>
          </label>
          <button
            type="button"
            onClick={() => startTransition(() => deleteTask(t.id))}
            aria-label={`Delete task: ${t.title}`}
            className="shrink-0 rounded p-1.5 text-neutral-500 opacity-0 hover:bg-black/[.05] hover:text-neutral-900 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </li>
      ))}
    </ul>
  );
}
