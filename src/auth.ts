import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

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
      from: "Artist Dashboard <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier, url }) {
        await sendEmail({
          to: identifier,
          subject: "Sign in to Artist Dashboard",
          html: `<p>Click below to sign in.</p><p><a href="${url}">${url}</a></p>`,
        });
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
