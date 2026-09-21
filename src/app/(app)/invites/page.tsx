import { notFound } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeedbackAdmin } from "@/lib/admin";
import { allowlistEnforced } from "@/lib/access";
import { PageHeader } from "../PageHeader";
import { addInvites, removeInvite } from "./inviteActions";

export default async function InvitesPage() {
  const session = await auth();
  if (!isFeedbackAdmin(session?.user?.email)) notFound();

  const [invites, users] = await Promise.all([
    prisma.allowedEmail.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { email: true }, orderBy: { email: "asc" } }),
  ]);
  const signedUp = new Set(users.map((u) => u.email.toLowerCase()));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader title="Invites" icon={UserPlus} />

      <p className="mb-6 text-sm text-neutral-600">
        Only these emails (plus admins) can sign in. Add a tester here, then send them the link. Removing someone
        blocks new sign-ins; it doesn&apos;t delete their data.
        {!allowlistEnforced() && " Not enforced on this local server."}
      </p>

      <form action={addInvites} className="mb-8 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="emails" className="sr-only">
          Emails to invite
        </label>
        <input
          id="emails"
          name="emails"
          required
          placeholder="friend@example.com, another@example.com"
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-primary py-2">
          Invite
        </button>
      </form>

      {invites.length === 0 ? (
        <p className="text-sm text-neutral-500">No one invited yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-xl bg-white shadow-[0_0_0_1px_rgba(55,53,47,0.09)]">
          {invites.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0 truncate text-sm text-neutral-900">{i.email}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className={`pill ${signedUp.has(i.email) ? "tag-green" : "tag-gray"}`}>
                  {signedUp.has(i.email) ? "Has signed in" : "Not yet"}
                </span>
                <form action={removeInvite.bind(null, i.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove ${i.email}`}
                    className="rounded p-1 text-neutral-500 hover:bg-black/[.05] hover:text-neutral-900"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
