"use client";

import { useEffect, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function key(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// This week, Monday to Sunday, with today filled and a dot under any day that
// has a deadline. Computed in the browser so "today" is the viewer's today.
export function WeekStrip({ markedDays }: { markedDays: string[] }) {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  if (!today) return <div className="h-14" aria-hidden />;

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const marked = new Set(markedDays);

  return (
    <ol className="grid grid-cols-7 gap-1 pb-3 text-center">
      {DAYS.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isToday = key(d) === key(today);
        return (
          <li key={label} className="flex flex-col items-center gap-1">
            <span className="text-xs text-neutral-500">{label}</span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                isToday ? "bg-blue-600 text-white" : "text-neutral-900"
              }`}
              aria-current={isToday ? "date" : undefined}
            >
              {d.getDate()}
            </span>
            <span
              aria-hidden
              className={`h-1 w-1 rounded-full ${marked.has(key(d)) ? "bg-blue-600" : "bg-transparent"}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
