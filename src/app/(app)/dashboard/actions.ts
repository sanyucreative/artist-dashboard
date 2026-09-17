"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser, isWorkspaceEmpty } from "@/lib/dashboard";
import { seedDemoData, seedDemoTasks } from "@/lib/demo-data";

export async function loadDemoData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const workspace = await getWorkspaceForUser(session.user.id);
  if (!(await isWorkspaceEmpty(workspace.id))) return;

  await seedDemoData(workspace.id);
  revalidatePath("/dashboard");
}

export async function loadDemoTasks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const workspace = await getWorkspaceForUser(session.user.id);
  const [taskCount, categoryCount] = await Promise.all([
    prisma.task.count({ where: { workspaceId: workspace.id } }),
    prisma.taskCategory.count({ where: { workspaceId: workspace.id } }),
  ]);
  if (taskCount > 0 || categoryCount > 0) return;

  await seedDemoTasks(workspace.id);
  revalidatePath("/dashboard");
}
