"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTask } from "./taskActions";

// Lives in the widget's non-scrolling header zone, not the resizable task
// list below -- so "add a task" stays reachable even when the widget has
// been resized short or the list has scrolled.
export function TaskWidgetHeader({
  icon,
  label,
  categoryId,
}: {
  icon: React.ReactNode;
  label: string;
  categoryId: string | null;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const value = title.trim();
    if (!value) {
      setAdding(false);
      return;
    }
    setTitle("");
    startTransition(async () => {
      await createTask(value, categoryId);
      inputRef.current?.focus();
    });
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-h-7 items-center gap-2">
        {icon}
        <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-neutral-900">{label}</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-label={`Add task to ${label}`}
          aria-expanded={adding}
          className="-mr-1 shrink-0 rounded p-1.5 text-neutral-500 hover:bg-black/[.05] hover:text-neutral-900"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
      {adding && (
        <input
          ref={inputRef}
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") {
              setTitle("");
              setAdding(false);
            }
          }}
          onBlur={() => {
            if (!title.trim()) setAdding(false);
          }}
          placeholder="Task title, then Enter"
          aria-label={`New task in ${label}`}
          disabled={pending}
          className="mt-1 mb-1 w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm"
        />
      )}
    </div>
  );
}
