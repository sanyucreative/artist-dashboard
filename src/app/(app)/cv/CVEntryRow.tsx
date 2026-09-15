"use client";

import { useState, useTransition } from "react";
import { deleteCVEntry, updateCVEntry } from "./actions";
import { CVEntryFields } from "./CVEntryFields";
import { dateYearUTC } from "@/lib/format";

export type CVEntryData = {
  id: string;
  category: string;
  title: string;
  organization: string | null;
  location: string | null;
  date: Date | null;
  description: string | null;
  isPublic: boolean;
  sourceApplicationId: string | null;
};

export function CVEntryRow({ entry }: { entry: CVEntryData }) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="rounded-md border border-neutral-200 p-3">
        <form
          action={async (formData) => {
            await updateCVEntry(entry.id, formData);
            setEditing(false);
          }}
          className="grid grid-cols-2 gap-2"
        >
          <CVEntryFields entry={entry} />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-neutral-500">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => deleteCVEntry(entry.id))}
              className="ml-auto text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 p-2.5">
      <div>
        <span className="text-sm text-neutral-900">{entry.title}</span>
        {entry.sourceApplicationId && (
          <span className="ml-2 tag tag-blue">auto</span>
        )}
        {!entry.isPublic && (
          <span className="ml-2 tag tag-gray">hidden from export</span>
        )}
        <p className="text-xs text-neutral-500">
          {[entry.organization, entry.location, entry.date && dateYearUTC(entry.date)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-xs text-neutral-500 hover:text-neutral-900">
        Edit
      </button>
    </li>
  );
}
