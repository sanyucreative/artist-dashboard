"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";

async function currentWorkspaceId() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  return workspace.id;
}

export async function createTask(title: string, categoryId: string | null) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const workspaceId = await currentWorkspaceId();
  const last = await prisma.task.findFirst({ where: { workspaceId, categoryId }, orderBy: { position: "desc" } });
  await prisma.task.create({
    data: { workspaceId, categoryId, title: trimmed, position: (last?.position ?? -1) + 1 },
  });
  revalidatePath("/dashboard");
}

export async function toggleTask(id: string, done: boolean) {
  await prisma.task.update({ where: { id }, data: { done } });
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function createTaskCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const workspaceId = await currentWorkspaceId();
  const last = await prisma.taskCategory.findFirst({ where: { workspaceId }, orderBy: { position: "desc" } });
  await prisma.taskCategory.create({
    data: { workspaceId, name: trimmed, position: (last?.position ?? -1) + 1 },
  });
  revalidatePath("/dashboard");
}
