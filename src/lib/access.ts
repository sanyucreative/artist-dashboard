import { prisma } from "@/lib/prisma";
import { isFeedbackAdmin } from "@/lib/admin";

// Invite-only sign-in. Admins can always sign in; everyone else must be on the
// AllowedEmail list. Enforced in production, and locally only when
// ENFORCE_ALLOWLIST=1, so local development doesn't need an invite.
export function allowlistEnforced() {
  return process.env.NODE_ENV === "production" || process.env.ENFORCE_ALLOWLIST === "1";
}

export async function isEmailAllowed(email: string | null | undefined) {
  if (!allowlistEnforced()) return true;
  if (!email) return false;
  if (isFeedbackAdmin(email)) return true;
  const found = await prisma.allowedEmail.count({ where: { email: email.trim().toLowerCase() } });
  return found > 0;
}
