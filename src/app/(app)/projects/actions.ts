"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function themesFromInput(formData: FormData) {
  const raw = str(formData, "themes") ?? "";
  const list = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return JSON.stringify(list);
}

export async function createProject(formData: FormData) {
  const workspaceId = await currentWorkspaceId();
  const project = await prisma.project.create({
    data: {
      workspaceId,
      title: str(formData, "title") ?? "Untitled project",
      workingTitle: str(formData, "workingTitle"),
      status: str(formData, "status") ?? "active",
      description: str(formData, "description"),
      startDate: dateVal(formData, "startDate"),
      medium: str(formData, "medium"),
      themes: themesFromInput(formData),
      isOngoing: formData.get("isOngoing") === "on",
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  await prisma.project.update({
    where: { id },
    data: {
      title: str(formData, "title") ?? "Untitled project",
      workingTitle: str(formData, "workingTitle"),
      status: str(formData, "status") ?? "active",
      description: str(formData, "description"),
      startDate: dateVal(formData, "startDate"),
      medium: str(formData, "medium"),
      themes: themesFromInput(formData),
      isOngoing: formData.get("isOngoing") === "on",
    },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  redirect("/projects");
}

export async function addParticipant(projectId: string, formData: FormData) {
  await prisma.participant.create({
    data: {
      projectId,
      name: str(formData, "name") ?? "Unnamed",
      role: str(formData, "role"),
      contactEmail: str(formData, "contactEmail"),
      consentStatus: str(formData, "consentStatus") ?? "not_requested",
      notes: str(formData, "notes"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateParticipantConsent(projectId: string, participantId: string, consentStatus: string) {
  await prisma.participant.update({ where: { id: participantId }, data: { consentStatus } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteParticipant(projectId: string, participantId: string) {
  await prisma.participant.delete({ where: { id: participantId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function addMilestone(projectId: string, formData: FormData) {
  await prisma.milestone.create({
    data: {
      projectId,
      title: str(formData, "title") ?? "Untitled milestone",
      dueDate: dateVal(formData, "dueDate"),
      status: str(formData, "status") ?? "planned",
      notes: str(formData, "notes"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function setMilestoneStatus(projectId: string, milestoneId: string, status: string) {
  await prisma.milestone.update({ where: { id: milestoneId }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteMilestone(projectId: string, milestoneId: string) {
  await prisma.milestone.delete({ where: { id: milestoneId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function addExhibition(projectId: string, formData: FormData) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  await prisma.cVEntry.create({
    data: {
      workspaceId: project.workspaceId,
      projectId,
      category: str(formData, "category") ?? "exhibition",
      title: str(formData, "title") ?? "Untitled",
      organization: str(formData, "organization"),
      location: str(formData, "location"),
      date: dateVal(formData, "date"),
      description: str(formData, "description"),
      isPublic: true,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteExhibition(projectId: string, cvEntryId: string) {
  await prisma.cVEntry.delete({ where: { id: cvEntryId } });
  revalidatePath(`/projects/${projectId}`);
}
