"use client";

import { useState, useTransition } from "react";
import { addMilestone, deleteMilestone, setMilestoneStatus } from "../actions";
import { MILESTONE_STATUSES, titleCase } from "@/lib/constants";
import { formatFullDate } from "@/lib/format";

type Milestone = {
  id: string;
  title: string;
  dueDate: Date | null;
  status: string;
  notes: string | null;
};

export function MilestoneList({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";

  return (
    <div>
      {milestones.length === 0 ? (
        <p className="text-sm text-neutral-500">No milestones yet.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 p-2.5">
              <div>
                <span className="text-sm text-neutral-900">{m.title}</span>
                {m.dueDate && (
                  <span className="ml-2 text-xs text-neutral-500">{formatFullDate(m.dueDate)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.status}
                  disabled={isPending}
                  onChange={(e) => startTransition(() => setMilestoneStatus(projectId, m.id, e.target.value))}
                  className="rounded border border-neutral-200 px-1.5 py-0.5 text-[11px]"
                >
                  {MILESTONE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {titleCase(s)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteMilestone(projectId, m.id))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          action={async (formData) => {
            await addMilestone(projectId, formData);
            setAdding(false);
          }}
          className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 p-3"
        >
          <input name="title" placeholder="Title" required className={input + " col-span-2"} />
          <input type="date" name="dueDate" className={input} />
          <select name="status" defaultValue="planned" className={input}>
            {MILESTONE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notes" className={input + " col-span-2"} />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-neutral-500">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-sm text-neutral-500 hover:text-neutral-900">
          + Add milestone
        </button>
      )}
    </div>
  );
}
