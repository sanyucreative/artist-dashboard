"use client";

import { useState } from "react";
import { createProject } from "./actions";
import { ProjectFields } from "./ProjectFields";

export function NewProjectForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
      >
        + New project
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-neutral-200 p-4">
      <form action={createProject} className="grid grid-cols-2 gap-3">
        <ProjectFields />
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
