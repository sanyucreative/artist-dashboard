"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/opportunities", label: "Opportunities", icon: "🎯" },
  { href: "/projects", label: "Projects", icon: "🖼️" },
  { href: "/assets", label: "Assets", icon: "📁" },
  { href: "/cv", label: "CV", icon: "📄" },
  { href: "/insights", label: "Insights", icon: "📊" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV_LINKS.map((l) => {
        const active = pathname === l.href || pathname?.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
              active
                ? "bg-black/[.06] font-medium text-neutral-900"
                : "text-neutral-700 hover:bg-black/[.04]"
            }`}
          >
            <span className="text-[15px] leading-none">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
