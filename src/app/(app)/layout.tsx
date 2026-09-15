import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-neutral-900">Artist CRM</span>
            <nav className="flex gap-4 text-sm text-neutral-500">
              <Link href="/dashboard" className="hover:text-neutral-900">
                Dashboard
              </Link>
              <Link href="/opportunities" className="hover:text-neutral-900">
                Opportunities
              </Link>
              <Link href="/projects" className="hover:text-neutral-900">
                Projects
              </Link>
              <Link href="/assets" className="hover:text-neutral-900">
                Assets
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-500">{workspace.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-sm text-neutral-500 hover:text-neutral-900">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
