"use client";

import { useEffect, useState } from "react";

// Computed in the browser so "morning/evening" and the date follow the
// viewer's own clock and timezone, not the server's (UTC on Netlify).
export function Greeting({ name }: { name: string | null }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const hour = now?.getHours() ?? 12;
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const first = name?.trim().split(/\s+/)[0];

  return (
    <div>
      <p className="min-h-5 text-sm text-neutral-500">
        {now?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h1 className="mt-1 text-[32px] leading-tight font-semibold tracking-tight text-neutral-900">
        {now ? `Good ${part}${first ? `, ${first}` : ""}` : "Welcome"}
      </h1>
    </div>
  );
}
