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
        className="btn-primary"
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
          <button type="submit" className="btn-primary">
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
