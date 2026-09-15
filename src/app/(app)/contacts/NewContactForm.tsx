"use client";

import { useState } from "react";
import { createContact } from "./actions";
import { ContactFields } from "./ContactFields";

export function NewContactForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
      >
        + New contact
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-neutral-200 p-4">
      <form
        action={async (formData) => {
          await createContact(formData);
          setOpen(false);
        }}
        className="grid grid-cols-2 gap-3"
      >
        <ContactFields />
        <div className="col-span-2 flex gap-2">
          <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
            Create
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
