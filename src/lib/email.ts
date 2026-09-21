// Resend's free tier has no SMTP, only an HTTP API. Falls back to logging
// the email to the console when RESEND_API_KEY isn't set (local dev, or
// before the account is set up), so nothing breaks either way.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "Plinth <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.log(`\n=== Email to ${to} ===\nSubject: ${subject}\n${html}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed to send email to ${to}: ${res.status} ${body}`);
  }
}
