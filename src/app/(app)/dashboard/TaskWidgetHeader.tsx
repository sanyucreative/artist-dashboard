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
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-700">{label}</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-label={`Add task to ${label}`}
          className="shrink-0 rounded text-neutral-400 hover:text-neutral-900"
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
          placeholder="Task title"
          disabled={pending}
          className="mt-2 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none"
        />
      )}
    </div>
  );
}
