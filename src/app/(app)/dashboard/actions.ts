"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getWorkspaceForUser, isWorkspaceEmpty } from "@/lib/dashboard";
import { seedDemoData } from "@/lib/demo-data";

export async function loadDemoData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const workspace = await getWorkspaceForUser(session.user.id);
  if (!(await isWorkspaceEmpty(workspace.id))) return;

  await seedDemoData(workspace.id);
  revalidatePath("/dashboard");
}
