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

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function createAsset(formData: FormData) {
  const workspaceId = await currentWorkspaceId();
  await prisma.asset.create({
    data: {
      workspaceId,
      type: str(formData, "type") ?? "other",
      title: str(formData, "title") ?? "Untitled asset",
      fileUrl: str(formData, "fileUrl"),
      version: str(formData, "version"),
      projectId: str(formData, "projectId"),
      notes: str(formData, "notes"),
    },
  });
  revalidatePath("/assets");
  revalidatePath("/projects");
}

export async function updateAsset(id: string, formData: FormData) {
  await prisma.asset.update({
    where: { id },
    data: {
      type: str(formData, "type") ?? "other",
      title: str(formData, "title") ?? "Untitled asset",
      fileUrl: str(formData, "fileUrl"),
      version: str(formData, "version"),
      projectId: str(formData, "projectId"),
      notes: str(formData, "notes"),
    },
  });
  revalidatePath("/assets");
  revalidatePath("/projects");
}

export async function deleteAsset(id: string) {
  await prisma.asset.delete({ where: { id } });
  revalidatePath("/assets");
  revalidatePath("/projects");
}
