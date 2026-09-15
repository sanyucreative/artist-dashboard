"use client";

import { useState, useTransition } from "react";
import { addExhibition, deleteExhibition } from "../actions";
import { CV_CATEGORIES, titleCase } from "@/lib/constants";
import { formatFullDate } from "@/lib/format";

type Entry = {
  id: string;
  category: string;
  title: string;
  organization: string | null;
  location: string | null;
  date: Date | null;
};

export function ExhibitionHistory({ projectId, entries }: { projectId: string; entries: Entry[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";

  return (
    <div>
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">No exhibition history recorded yet.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 p-2.5">
              <div>
                <span className="text-sm text-neutral-900">{e.title}</span>
                <span className="ml-2 tag tag-gray">
                  {titleCase(e.category)}
                </span>
                <p className="text-xs text-neutral-500">
                  {[e.organization, e.location, e.date && formatFullDate(e.date)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => deleteExhibition(projectId, e.id))}
                className="shrink-0 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          action={async (formData) => {
            await addExhibition(projectId, formData);
            setAdding(false);
          }}
          className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 p-3"
        >
          <input name="title" placeholder="Title" required className={input + " col-span-2"} />
          <select name="category" defaultValue="exhibition" className={input}>
            {CV_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </select>
          <input type="date" name="date" className={input} />
          <input name="organization" placeholder="Organization / venue" className={input} />
          <input name="location" placeholder="Location" className={input} />
          <input name="description" placeholder="Notes" className={input + " col-span-2"} />
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
          + Add to exhibition history
        </button>
      )}
    </div>
  );
}
