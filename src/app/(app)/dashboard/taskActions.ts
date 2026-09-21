"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const currentWorkspaceId = requireWorkspaceId;

export async function createTask(title: string, categoryId: string | null) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const workspaceId = await currentWorkspaceId();
  if (categoryId && !(await prisma.taskCategory.count({ where: { id: categoryId, workspaceId } }))) {
    throw new Error("Not found");
  }
  const last = await prisma.task.findFirst({ where: { workspaceId, categoryId }, orderBy: { position: "desc" } });
  await prisma.task.create({
    data: { workspaceId, categoryId, title: trimmed, position: (last?.position ?? -1) + 1 },
  });
  revalidatePath("/dashboard");
}

export async function toggleTask(id: string, done: boolean) {
  const workspaceId = await currentWorkspaceId();
  await prisma.task.updateMany({ where: { id, workspaceId }, data: { done } });
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const workspaceId = await currentWorkspaceId();
  await prisma.task.deleteMany({ where: { id, workspaceId } });
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
