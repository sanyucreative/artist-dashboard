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

function dateVal(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? new Date(v) : null;
}

export async function createCVEntry(formData: FormData) {
  const workspaceId = await currentWorkspaceId();
  await prisma.cVEntry.create({
    data: {
      workspaceId,
      category: str(formData, "category") ?? "exhibition",
      title: str(formData, "title") ?? "Untitled",
      organization: str(formData, "organization"),
      location: str(formData, "location"),
      date: dateVal(formData, "date"),
      description: str(formData, "description"),
      isPublic: formData.get("isPublic") !== "off",
    },
  });
  revalidatePath("/cv");
}

export async function updateCVEntry(id: string, formData: FormData) {
  await prisma.cVEntry.update({
    where: { id },
    data: {
      category: str(formData, "category") ?? "exhibition",
      title: str(formData, "title") ?? "Untitled",
      organization: str(formData, "organization"),
      location: str(formData, "location"),
      date: dateVal(formData, "date"),
      description: str(formData, "description"),
      isPublic: formData.get("isPublic") !== "off",
    },
  });
  revalidatePath("/cv");
}

export async function deleteCVEntry(id: string) {
  await prisma.cVEntry.delete({ where: { id } });
  revalidatePath("/cv");
}
