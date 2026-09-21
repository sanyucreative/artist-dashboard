"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

const ORDER_KEY = "dashboard-widget-order";
const HEIGHT_KEY_PREFIX = "dashboard-widget-height-";

export type Widget = {
  id: string;
  header: React.ReactNode;
  content: React.ReactNode;
};

function loadOrder(defaultIds: string[]): string[] {
  if (typeof window === "undefined") return defaultIds;
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
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

function loadHeight(id: string): number | undefined {
  try {
    const raw = window.localStorage.getItem(HEIGHT_KEY_PREFIX + id);
    const n = raw ? Number(raw) : NaN;
    return isNaN(n) ? undefined : n;
  } catch {
    return undefined;
  }
}

// A plain div with the native CSS `resize` handle -- the browser draws the
// drag corner and enforces the drag itself; this just remembers whatever
// size the user leaves it at, per widget, per browser.
function ResizableContent({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = loadHeight(id);
    if (saved) el.style.height = `${saved}px`;

    const observer = new ResizeObserver(() => {
      // Native resize writes an inline height; auto layout never does. Saving
      // only inline heights stops the first render from freezing a widget at
      // its initial size, which would clip every task added afterwards.
      if (!el.style.height) return;
      const h = Math.round(el.getBoundingClientRect().height);
      try {
        window.localStorage.setItem(HEIGHT_KEY_PREFIX + id, String(h));
      } catch {
        // ignore -- resizing still works for this session
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return (
    <div ref={ref} className="-mx-4 min-h-[64px] resize-y overflow-x-hidden overflow-y-auto px-4 pb-1">
      {children}
    </div>
  );
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

  function persistOrder(next: string[]) {
    setOrder(next);
    try {
      window.localStorage.setItem(ORDER_KEY, JSON.stringify(next));
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
    persistOrder(next);
    setDragId(null);
  }

  function move(id: string, delta: number) {
    const from = order.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= order.length) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(to, 0, id);
    persistOrder(next);
  }

  const byId = new Map(widgets.map((w) => [w.id, w]));
  // Before hydration, render in the server-rendered default order so there's
  // no flash of reordered content once localStorage is read.
  const visibleOrder = mounted ? order : defaultIds;

  return (
    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
      {visibleOrder.map((id) => {
        const widget = byId.get(id);
        if (!widget) return null;
        return (
          <div
            key={id}
            draggable
            data-dragging={dragId === id}
            onDragStart={() => setDragId(id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(id)}
            className="widget-card p-4"
          >
            <div className="mb-3 flex items-start gap-1.5">
              <button
                type="button"
                aria-label="Move widget. Drag, or use the arrow keys."
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    move(id, -1);
                  }
                  if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    move(id, 1);
                  }
                }}
                className="-ml-1 mt-px shrink-0 cursor-grab touch-none rounded p-1 text-neutral-500 hover:bg-black/[.05] hover:text-neutral-800 active:cursor-grabbing"
              >
                <GripVertical size={16} strokeWidth={2} />
              </button>
              {/* Touch screens can't drag with native HTML5 drag-and-drop, so
                  show explicit move buttons there instead. */}
              <div className="hidden shrink-0 items-center [@media(pointer:coarse)]:flex">
                <button type="button" aria-label="Move widget up" onClick={() => move(id, -1)} className="rounded p-1 text-neutral-500 active:bg-black/[.05]">
                  <ChevronUp size={16} strokeWidth={2} />
                </button>
                <button type="button" aria-label="Move widget down" onClick={() => move(id, 1)} className="rounded p-1 text-neutral-500 active:bg-black/[.05]">
                  <ChevronDown size={16} strokeWidth={2} />
                </button>
              </div>
              {widget.header}
            </div>
            <ResizableContent id={id}>{widget.content}</ResizableContent>
          </div>
        );
      })}
    </div>
  );
}
