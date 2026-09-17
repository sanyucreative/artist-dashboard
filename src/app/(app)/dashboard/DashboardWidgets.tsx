"use client";

import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";

const STORAGE_KEY = "dashboard-widget-order";

export type Widget = {
  id: string;
  header: React.ReactNode;
  content: React.ReactNode;
};

function loadOrder(defaultIds: string[]): string[] {
  if (typeof window === "undefined") return defaultIds;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultIds;
    const saved: string[] = JSON.parse(raw);
    // Keep only ids that still exist, then append any new widget ids that
    // weren't there when the order was last saved.
    const known = saved.filter((id) => defaultIds.includes(id));
    const missing = defaultIds.filter((id) => !known.includes(id));
    return [...known, ...missing];
  } catch {
    return defaultIds;
  }
}

export function DashboardWidgets({ widgets }: { widgets: Widget[] }) {
  const defaultIds = widgets.map((w) => w.id);
  const [order, setOrder] = useState<string[]>(defaultIds);
  const [dragId, setDragId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOrder(loadOrder(defaultIds));
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: string[]) {
    setOrder(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing / blocked storage -- reordering still works for
      // this session, it just won't be remembered next visit.
    }
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    persist(next);
    setDragId(null);
  }

  const byId = new Map(widgets.map((w) => [w.id, w]));
  // Before hydration, render in the server-rendered default order so there's
  // no flash of reordered content once localStorage is read.
  const visibleOrder = mounted ? order : defaultIds;

  return (
    <div className="flex flex-col gap-6">
      {visibleOrder.map((id) => {
        const widget = byId.get(id);
        if (!widget) return null;
        return (
          <section
            key={id}
            draggable
            onDragStart={() => setDragId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(id)}
            className={`rounded-lg transition-opacity ${dragId === id ? "opacity-40" : ""}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
                aria-hidden
              >
                <GripVertical size={16} strokeWidth={2} />
              </span>
              {widget.header}
            </div>
            {widget.content}
          </section>
        );
      })}
    </div>
  );
}
