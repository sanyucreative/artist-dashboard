"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createTask, toggleTask, deleteTask } from "./taskActions";

export type TaskData = { id: string; title: string; done: boolean };

export function TaskWidget({ tasks, categoryId }: { tasks: TaskData[]; categoryId: string | null }) {
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
    <div className="rounded-lg border border-neutral-200">
      {tasks.length === 0 && !adding && <p className="px-3 py-3 text-sm text-neutral-500">No tasks yet.</p>}
      {tasks.length > 0 && (
        <ul className="divide-y divide-neutral-200">
          {tasks.map((t) => (
            <li key={t.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-black/[.02]">
              <input
                type="checkbox"
                checked={t.done}
                onChange={(e) => startTransition(() => toggleTask(t.id, e.target.checked))}
                className="h-4 w-4 shrink-0 accent-neutral-800"
              />
              <span className={`flex-1 text-sm ${t.done ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => startTransition(() => deleteTask(t.id))}
                aria-label="Delete task"
                className="shrink-0 text-neutral-300 opacity-0 hover:text-neutral-600 group-hover:opacity-100"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="flex items-center gap-2 border-t border-neutral-200 px-3 py-2">
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
            className="flex-1 text-sm outline-none"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={`flex w-full items-center gap-1.5 px-3 py-2 text-sm text-neutral-500 hover:bg-black/[.02] hover:text-neutral-900 ${
            tasks.length > 0 ? "border-t border-neutral-200" : ""
          }`}
        >
          <Plus size={14} strokeWidth={2} /> Add task
        </button>
      )}
    </div>
  );
}
