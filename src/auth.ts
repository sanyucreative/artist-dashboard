import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Local dev has no real mail provider wired up yet (per the "start
// local/free, upgrade later" plan) -- `server` below is a required but
// unused placeholder, since sendVerificationRequest is fully overridden to
// print the magic link to the terminal instead of emailing it. Swap in a
// real SMTP/API config (Resend, Postmark, ...) when deploying.
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
      from: "noreply@artist-crm.local",
      async sendVerificationRequest({ identifier, url }) {
        console.log("\n=== Magic link for", identifier, "===\n" + url + "\n");
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
