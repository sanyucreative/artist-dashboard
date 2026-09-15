import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Resend's free tier has no SMTP, only an HTTP API -- so instead of Nodemailer's
// SMTP transport we call Resend's API directly inside sendVerificationRequest.
// Falls back to logging the link to the console when RESEND_API_KEY isn't set
// (local dev, or before the account is set up), so nothing breaks either way.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "Artist Dashboard <onboarding@resend.dev>";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  // Auth.js auto-trusts the host on Vercel (it detects the VERCEL env var)
  // but not on Netlify or anywhere else -- without this, every request in
  // production throws "UntrustedHost" rather than actually signing in.
  trustHost: true,
  providers: [
    Nodemailer({
      server: { host: "localhost", port: 25 },
      from: RESEND_FROM,
      async sendVerificationRequest({ identifier, url }) {
        if (!RESEND_API_KEY) {
          console.log("\n=== Magic link for", identifier, "===\n" + url + "\n");
          return;
        }

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: identifier,
            subject: "Sign in to Artist Dashboard",
            html: `<p>Click below to sign in.</p><p><a href="${url}">${url}</a></p>`,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Resend failed to send sign-in email: ${res.status} ${body}`);
        }
      },
    }),
  ],
  pages: {
    verifyRequest: "/auth/check-email",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
