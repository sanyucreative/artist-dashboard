"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceId, ownsProjectOrNull } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const currentWorkspaceId = requireWorkspaceId;

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function createAsset(formData: FormData) {
  const workspaceId = await currentWorkspaceId();
  await ownsProjectOrNull(workspaceId, str(formData, "projectId"));
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
  const workspaceId = await currentWorkspaceId();
  await ownsProjectOrNull(workspaceId, str(formData, "projectId"));
  await prisma.asset.updateMany({
    where: { id, workspaceId },
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
  const workspaceId = await currentWorkspaceId();
  await prisma.asset.deleteMany({ where: { id, workspaceId } });
  revalidatePath("/assets");
  revalidatePath("/projects");
}
