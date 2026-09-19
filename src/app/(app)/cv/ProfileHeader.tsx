"use client";

import { useState } from "react";
import { Download, FileText, Pencil } from "lucide-react";
import { updateProfile } from "./profileActions";

export function ProfileHeader({
  name,
  disciplines,
  initial,
  workspaceLabel,
  stats,
}: {
  name: string | null;
  disciplines: string[];
  initial: string;
  workspaceLabel: string;
  stats: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,15,15,0.06),0_2px_8px_rgba(15,15,15,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-2xl font-semibold text-white">
            {initial}
          </span>
          {editing ? (
            <form
              action={async (formData) => {
                await updateProfile(formData);
                setEditing(false);
              }}
              className="flex flex-col gap-2"
            >
              <input
                name="name"
                defaultValue={name ?? ""}
                placeholder="Your name"
                className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm font-medium"
                autoFocus
              />
              <input
                name="disciplines"
                defaultValue={disciplines.join(", ")}
                placeholder="Disciplines, comma separated (e.g. photography, textile)"
                className="w-64 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary btn-sm">
                  Save
                </button>
                <button type="button" onClick={() => setEditing(false)} className="text-xs text-neutral-500">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">{name ?? "Add your name"}</h1>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label="Edit profile"
                  className="text-neutral-300 hover:text-neutral-600"
                >
                  <Pencil size={14} strokeWidth={2} />
                </button>
              </div>
              <p className="text-sm text-neutral-500">{workspaceLabel}</p>
              {disciplines.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {disciplines.map((d) => (
                    <span key={d} className="tag tag-blue">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
          <a
            href="/cv/export/pdf"
            className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-black/[.02]"
          >
            <Download size={14} strokeWidth={2} /> Export PDF
          </a>
          <a href="/cv/export/text" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
            <FileText size={14} strokeWidth={2} /> Export as text
          </a>
        </div>
      </div>

      {stats}
    </div>
  );
}
