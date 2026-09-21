"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Image, FolderOpen, FileText, Users, Inbox, Plus } from "lucide-react";
import { FeedbackButton } from "./FeedbackButton";

const BASE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Target },
  { href: "/projects", label: "Projects", icon: Image },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/cv", label: "Profile", icon: FileText },
  { href: "/contacts", label: "Contacts", icon: Users },
];

// Soft square colors for the project list, picked deterministically from the
// project id so a project keeps its color between visits.
const PROJECT_COLORS = ["#e879c6", "#86efac", "#93c5fd", "#fcd34d", "#c4b5fd", "#fdba74"];
function colorFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PROJECT_COLORS[h % PROJECT_COLORS.length];
}

export function SidebarNav({
  isAdmin = false,
  projects = [],
}: {
  isAdmin?: boolean;
  projects?: { id: string; title: string }[];
}) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...BASE_LINKS, { href: "/feedback", label: "Feedback inbox", icon: Inbox }]
    : BASE_LINKS;

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {links.map((l) => {
        const active = pathname === l.href || pathname?.startsWith(l.href + "/");
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
              active ? "bg-blue-600 font-medium text-white" : "text-neutral-700 hover:bg-black/[.05]"
            }`}
          >
            <Icon size={16} strokeWidth={2} className={`shrink-0 ${active ? "text-white" : "text-neutral-500"}`} />
            {l.label}
          </Link>
        );
      })}

      <div className="mt-4 border-t border-neutral-200 pt-4">
        <div className="mb-1 flex items-center justify-between px-2.5">
          <span className="text-sm font-semibold text-neutral-900">Projects</span>
          <Link
            href="/projects"
            aria-label="Go to projects"
            className="rounded p-1 text-neutral-500 hover:bg-black/[.05] hover:text-neutral-900"
          >
            <Plus size={15} strokeWidth={2} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="px-2.5 py-1 text-xs text-neutral-500">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-neutral-700 hover:bg-black/[.05]"
            >
              <span aria-hidden className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: colorFor(p.id) }} />
              <span className="truncate">{p.title}</span>
            </Link>
          ))
        )}
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-3">
        <FeedbackButton />
      </div>
    </nav>
  );
}
