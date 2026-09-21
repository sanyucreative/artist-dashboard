"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isFeedbackAdmin } from "@/lib/admin";

async function requireAdmin() {
  const session = await auth();
  if (!isFeedbackAdmin(session?.user?.email)) throw new Error("Not allowed");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts one or many emails separated by commas, spaces or new lines.
export async function addInvites(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("emails") ?? "");
  const emails = [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => EMAIL_RE.test(e)))];
  if (emails.length === 0) return;
  await prisma.allowedEmail.createMany({ data: emails.map((email) => ({ email })), skipDuplicates: true });
  revalidatePath("/invites");
}

export async function removeInvite(id: string) {
  await requireAdmin();
  await prisma.allowedEmail.deleteMany({ where: { id } });
  revalidatePath("/invites");
}
