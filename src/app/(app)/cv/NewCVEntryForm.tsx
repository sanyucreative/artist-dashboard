"use client";

import { useState } from "react";
import { createCVEntry } from "./actions";
import { CVEntryFields } from "./CVEntryFields";

export function NewCVEntryForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-neutral-500 hover:text-neutral-900">
        + Add entry manually
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <form
        action={async (formData) => {
          await createCVEntry(formData);
          setOpen(false);
        }}
        className="grid grid-cols-2 gap-3"
      >
        <CVEntryFields />
        <div className="col-span-2 flex gap-2">
          <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
            Add
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
