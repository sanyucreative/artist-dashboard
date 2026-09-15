import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/projects", label: "Projects" },
  { href: "/assets", label: "Assets" },
  { href: "/cv", label: "CV" },
  { href: "/insights", label: "Insights" },
  { href: "/contacts", label: "Contacts" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Middleware only does an optimistic cookie-presence check (it runs on
  // the Edge runtime and can't hit the database) -- this is the real check,
  // for the rare case of a stale/invalid cookie that passed that one.
  if (!session?.user?.id) redirect("/login");
  const workspace = await getWorkspaceForUser(session.user.id);

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 pt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="shrink-0 text-sm font-semibold text-neutral-900">Artist CRM</span>
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-xs text-neutral-500">{workspace.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="shrink-0 text-sm text-neutral-500 hover:text-neutral-900">Sign out</button>
              </form>
            </div>
          </div>
          <nav className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3 text-sm whitespace-nowrap text-neutral-500">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-neutral-900">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
