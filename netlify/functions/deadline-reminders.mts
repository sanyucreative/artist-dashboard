import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendEmail } from "../../src/lib/email";

// Runs daily. An opportunity's own notifyAt field (set per-opportunity, e.g.
// "remind me 2 weeks before") is the trigger; notifiedAt records that the
// email already went out so it isn't repeated on every subsequent run. Only
// opportunities that haven't already passed their deadline are considered,
// so a gap in runs doesn't dredge up stale reminders.
export default async () => {
  const connectionString = process.env.NETLIFY_DB_URL ?? "";
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const now = new Date();
    const due = await prisma.opportunity.findMany({
      where: {
        notifyAt: { lte: now },
        notifiedAt: null,
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
      include: { workspace: { include: { user: true } } },
    });

    const byUser = new Map<string, { email: string; items: typeof due }>();
    for (const opp of due) {
      const email = opp.workspace.user.email;
      if (!byUser.has(email)) byUser.set(email, { email, items: [] });
      byUser.get(email)!.items.push(opp);
    }

    for (const { email, items } of byUser.values()) {
      const rows = items
        .map((o) => {
          const due = o.deadline ? ` — due ${o.deadline.toLocaleDateString("en-US", { timeZone: "UTC" })}` : "";
          const org = o.organization ? ` (${o.organization})` : "";
          return `<li>${o.name}${org}${due}</li>`;
        })
        .join("");

      await sendEmail({
        to: email,
        subject:
          items.length === 1 ? `Deadline reminder: ${items[0].name}` : `${items.length} opportunity deadlines coming up`,
        html: `<p>These deadlines are coming up:</p><ul>${rows}</ul>`,
      });
    }

    if (due.length > 0) {
      await prisma.opportunity.updateMany({
        where: { id: { in: due.map((o) => o.id) } },
        data: { notifiedAt: now },
      });
    }

    return new Response(JSON.stringify({ ok: true, notified: due.length }), { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
};

export const config = {
  schedule: "@daily",
};
