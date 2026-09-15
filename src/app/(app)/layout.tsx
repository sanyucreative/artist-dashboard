import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { SidebarNav } from "./SidebarNav";
import { AppShell } from "./AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Middleware only does an optimistic cookie-presence check (it runs on
  // the Edge runtime and can't hit the database) -- this is the real check,
  // for the rare case of a stale/invalid cookie that passed that one.
  if (!session?.user?.id) redirect("/login");
  const workspace = await getWorkspaceForUser(session.user.id);

  return (
    <AppShell
      sidebar={
        <>
          <div className="mb-1 flex items-center gap-2 px-3 py-1">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-800 text-xs font-semibold text-white">
              {workspace.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-sm font-medium text-neutral-900">{workspace.name}</span>
          </div>

          <div className="mt-2">
            <SidebarNav />
          </div>

          <div className="mt-auto px-2 pt-3">
            <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5">
              <span className="truncate text-xs text-neutral-500">{session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="shrink-0 text-xs text-neutral-500 hover:text-neutral-900 hover:underline">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
