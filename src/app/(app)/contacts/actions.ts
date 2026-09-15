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

function tagsFromInput(formData: FormData) {
  const raw = str(formData, "tags") ?? "";
  const list = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return JSON.stringify(list);
}

export async function createContact(formData: FormData) {
  const workspaceId = await currentWorkspaceId();
  await prisma.contact.create({
    data: {
      workspaceId,
      name: str(formData, "name") ?? "Unnamed contact",
      organization: str(formData, "organization"),
      role: str(formData, "role"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      relationshipType: str(formData, "relationshipType"),
      notes: str(formData, "notes"),
      lastContactedAt: dateVal(formData, "lastContactedAt"),
      tags: tagsFromInput(formData),
      nextFollowUpDate: dateVal(formData, "nextFollowUpDate"),
      followUpNote: str(formData, "followUpNote"),
    },
  });
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
}

export async function updateContact(id: string, formData: FormData) {
  await prisma.contact.update({
    where: { id },
    data: {
      name: str(formData, "name") ?? "Unnamed contact",
      organization: str(formData, "organization"),
      role: str(formData, "role"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      relationshipType: str(formData, "relationshipType"),
      notes: str(formData, "notes"),
      lastContactedAt: dateVal(formData, "lastContactedAt"),
      tags: tagsFromInput(formData),
      nextFollowUpDate: dateVal(formData, "nextFollowUpDate"),
      followUpNote: str(formData, "followUpNote"),
    },
  });
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
}

export async function clearFollowUp(id: string) {
  await prisma.contact.update({ where: { id }, data: { nextFollowUpDate: null, followUpNote: null } });
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
}

export async function toggleContactOpportunity(contactId: string, opportunityId: string, linked: boolean) {
  if (linked) {
    await prisma.contactOpportunity.delete({ where: { contactId_opportunityId: { contactId, opportunityId } } });
  } else {
    await prisma.contactOpportunity.create({ data: { contactId, opportunityId } });
  }
  revalidatePath("/contacts");
}

export async function toggleContactProject(contactId: string, projectId: string, linked: boolean) {
  if (linked) {
    await prisma.contactProject.delete({ where: { contactId_projectId: { contactId, projectId } } });
  } else {
    await prisma.contactProject.create({ data: { contactId, projectId } });
  }
  revalidatePath("/contacts");
}
