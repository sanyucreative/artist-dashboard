import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { SidebarNav } from "./SidebarNav";
import { isFeedbackAdmin } from "@/lib/admin";
import { AppShell } from "./AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Middleware only does an optimistic cookie-presence check (it runs on
  // the Edge runtime and can't hit the database) -- this is the real check,
  // for the rare case of a stale/invalid cookie that passed that one.
  if (!session?.user?.id) redirect("/login");
  const workspace = await getWorkspaceForUser(session.user.id);
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, title: true },
  });

  return (
    <AppShell
      sidebar={
        <>
          <Link href="/dashboard" className="mb-6 block px-5 pt-2 font-serif text-[22px] leading-tight tracking-tight text-neutral-900">
            Artist Dashboard
          </Link>

          <SidebarNav isAdmin={isFeedbackAdmin(session.user.email)} projects={projects} />

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
