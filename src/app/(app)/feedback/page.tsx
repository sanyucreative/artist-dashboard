import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeedbackAdmin } from "@/lib/admin";
import { PageHeader } from "../PageHeader";

export default async function FeedbackPage() {
  const session = await auth();
  if (!isFeedbackAdmin(session?.user?.email)) notFound();

  const items = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader title="Feedback" icon={MessageSquare} />
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No feedback yet. It will show up here when testers send it.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((f) => (
            <li key={f.id} className="widget-card p-4">
              <p className="whitespace-pre-wrap text-sm text-neutral-900">{f.message}</p>
              <p className="mt-2 text-xs text-neutral-500">
                {f.user?.email ?? "Deleted account"}
                {f.page && <> · <code>{f.page}</code></>} ·{" "}
                {f.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
