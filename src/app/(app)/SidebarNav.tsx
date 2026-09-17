"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Image, FolderOpen, FileText, BarChart3, Users } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Target },
  { href: "/projects", label: "Projects", icon: Image },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/contacts", label: "Contacts", icon: Users },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV_LINKS.map((l) => {
        const active = pathname === l.href || pathname?.startsWith(l.href + "/");
        const Icon = l.icon;
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
            <Icon size={16} strokeWidth={2} className="shrink-0 text-neutral-500" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
