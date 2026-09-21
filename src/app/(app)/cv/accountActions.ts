"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

// Permanently deletes the signed-in user and everything in their workspace
// (projects, opportunities, applications, assets, tasks, profile entries).
// The caller must type their own email as confirmation. Feedback they sent is
// kept, but no longer linked to them.
export async function deleteAccount(confirmEmail: string): Promise<{ error: string }> {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user?.id || !email) return { error: "Please sign in again." };
  if (confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
    return { error: "That doesn't match your email address." };
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  // The session row is gone with the user, so clear the browser's cookie
  // directly rather than asking Auth.js to sign out a session that no longer exists.
  const jar = await cookies();
  for (const name of SESSION_COOKIES) jar.delete(name);
  redirect("/login");
}
