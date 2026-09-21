"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Where the heads-up email goes. Feedback is saved to the database either way;
// with no address configured, no email is sent.
const NOTIFY_EMAIL = process.env.FEEDBACK_NOTIFY_EMAIL;
const MAX_LENGTH = 4000;
const MAX_PER_HOUR = 10;

export async function submitFeedback(message: string, page: string): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in again to send feedback." };

  const trimmed = message.trim();
  if (!trimmed) return { error: "Write a few words first." };
  if (trimmed.length > MAX_LENGTH) return { error: `Please keep it under ${MAX_LENGTH} characters.` };

  const recent = await prisma.feedback.count({
    where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_HOUR) return { error: "That's a lot of feedback at once. Try again in a little while." };

  await prisma.feedback.create({
    data: { userId: session.user.id, message: trimmed, page: page.slice(0, 200) || null },
  });

  if (NOTIFY_EMAIL) {
    try {
      const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      await sendEmail({
        to: NOTIFY_EMAIL,
        subject: "Plinth feedback",
        html: `<p><strong>${esc(session.user.email ?? "A tester")}</strong> on <code>${esc(page)}</code>:</p><p style="white-space:pre-wrap">${esc(trimmed)}</p>`,
      });
    } catch (e) {
      console.error("Feedback saved but notification email failed", e);
    }
  }

  return { ok: true };
}
