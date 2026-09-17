"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export function AppShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the user navigates, so it doesn't stay open
  // over the next page on mobile.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm md:hidden"
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 -translate-x-full flex-col border-r border-neutral-200 bg-neutral-50 py-3 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        {sidebar}
      </aside>

      <div className="min-w-0 flex-1 pt-12 md:pt-0">{children}</div>
    </div>
  );
}
