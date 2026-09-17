"use client";

import { useRef, useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import { createTaskCategory } from "./taskActions";

export function AddTaskCategory() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <FolderPlus size={14} strokeWidth={2} /> Add task category
      </button>
    );
  }

  function submit() {
    const value = name.trim();
    if (!value) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await createTaskCategory(value);
      setName("");
      setOpen(false);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setName("");
            setOpen(false);
          }
        }}
        placeholder="Category name (e.g. Studio, Admin)"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-2.5 py-1 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-md bg-neutral-900 px-2.5 py-1 text-sm text-white disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">
        Cancel
      </button>
    </div>
  );
}
