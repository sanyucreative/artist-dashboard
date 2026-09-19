// Who can read tester feedback. Comma-separated emails in FEEDBACK_ADMIN_EMAILS.
const ADMINS = (process.env.FEEDBACK_ADMIN_EMAILS ?? "sanyucreative@gmail.com,sanyuprints@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isFeedbackAdmin(email: string | null | undefined) {
  return !!email && ADMINS.includes(email.toLowerCase());
}
