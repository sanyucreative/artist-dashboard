"use client";

import { useState } from "react";
import { updateProject, deleteProject } from "../actions";
import { ProjectFields } from "../ProjectFields";
import { titleCase } from "@/lib/constants";

type ProjectData = {
  id: string;
  title: string;
  workingTitle: string | null;
  status: string;
  description: string | null;
  startDate: Date | null;
  medium: string | null;
  themes: string;
  isOngoing: boolean;
};

export function ProjectHeader({ project }: { project: ProjectData }) {
  const [editing, setEditing] = useState(false);
  const themes: string[] = JSON.parse(project.themes || "[]");

  if (editing) {
    return (
      <div className="mb-8 rounded-lg border border-neutral-200 p-4">
        <form
          action={async (formData) => {
            await updateProject(project.id, formData);
            setEditing(false);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <ProjectFields project={project} />
          <div className="col-span-2 flex items-center gap-2">
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-neutral-500">
              Cancel
            </button>
            <form action={() => deleteProject(project.id)} className="ml-auto">
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Delete project
              </button>
            </form>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900">{project.title}</h1>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
              {titleCase(project.status)}
            </span>
            {project.isOngoing && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-700">Ongoing</span>
            )}
          </div>
          {project.workingTitle && <p className="text-sm text-neutral-500">{project.workingTitle}</p>}
        </div>
        <button type="button" onClick={() => setEditing(true)} className="text-sm text-neutral-500 hover:text-neutral-900">
          Edit
        </button>
      </div>
      {project.medium && <p className="mt-2 text-sm text-neutral-600">{project.medium}</p>}
      {themes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <span key={t} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
              {t}
            </span>
          ))}
        </div>
      )}
      {project.description && <p className="mt-3 text-sm text-neutral-700">{project.description}</p>}
    </div>
  );
}
