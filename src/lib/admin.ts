// Who administers the product (reads feedback, manages invites, always allowed
// to sign in). Comma-separated emails in FEEDBACK_ADMIN_EMAILS; no default, so
// no personal address is baked into the code.
const ADMINS = (process.env.FEEDBACK_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isFeedbackAdmin(email: string | null | undefined) {
  return !!email && ADMINS.includes(email.toLowerCase());
}
