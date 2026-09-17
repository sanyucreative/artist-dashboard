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

function num(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? Number(v) : null;
}

function dateVal(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? new Date(v) : null;
}

export async function createOpportunity(formData: FormData) {
  const workspaceId = await currentWorkspaceId();
  await prisma.opportunity.create({
    data: {
      workspaceId,
      name: str(formData, "name") ?? "Untitled opportunity",
      organization: str(formData, "organization"),
      type: str(formData, "type") ?? "grant",
      url: str(formData, "url"),
      deadline: dateVal(formData, "deadline"),
      notifyAt: dateVal(formData, "notifyAt"),
      feeAmount: num(formData, "feeAmount"),
      awardAmount: num(formData, "awardAmount"),
      discipline: str(formData, "discipline"),
      eligibilityNotes: str(formData, "eligibilityNotes"),
      isRecurring: formData.get("isRecurring") === "on",
      recurrenceCadence: str(formData, "recurrenceCadence"),
    },
  });
  revalidatePath("/opportunities");
}

export async function updateOpportunity(id: string, formData: FormData) {
  await prisma.opportunity.update({
    where: { id },
    data: {
      name: str(formData, "name") ?? "Untitled opportunity",
      organization: str(formData, "organization"),
      type: str(formData, "type") ?? "grant",
      url: str(formData, "url"),
      deadline: dateVal(formData, "deadline"),
      // Reset notifiedAt whenever the reminder date changes, so moving it
      // forward (or setting one for the first time) re-arms the reminder
      // instead of staying silenced by a previous send.
      notifyAt: dateVal(formData, "notifyAt"),
      notifiedAt: null,
      feeAmount: num(formData, "feeAmount"),
      awardAmount: num(formData, "awardAmount"),
      discipline: str(formData, "discipline"),
      eligibilityNotes: str(formData, "eligibilityNotes"),
      isRecurring: formData.get("isRecurring") === "on",
      recurrenceCadence: str(formData, "recurrenceCadence"),
    },
  });
  revalidatePath("/opportunities");
}

export async function deleteOpportunity(id: string) {
  await prisma.opportunity.delete({ where: { id } });
  revalidatePath("/opportunities");
}

export async function addEligibilityCriterion(opportunityId: string, formData: FormData) {
  const label = str(formData, "label");
  if (!label) return;
  await prisma.eligibilityCriterion.create({ data: { opportunityId, label } });
  revalidatePath("/opportunities");
}

export async function toggleEligibilityCriterion(opportunityId: string, criterionId: string, checked: boolean) {
  await prisma.eligibilityCriterion.update({ where: { id: criterionId }, data: { checked: !checked } });
  revalidatePath("/opportunities");
}

export async function deleteEligibilityCriterion(opportunityId: string, criterionId: string) {
  await prisma.eligibilityCriterion.delete({ where: { id: criterionId } });
  revalidatePath("/opportunities");
}

export async function startApplication(opportunityId: string) {
  const workspaceId = await currentWorkspaceId();
  const application = await prisma.application.create({
    data: { opportunityId, workspaceId, status: "researching" },
  });
  redirect(`/applications/${application.id}`);
}

// Minimal CSV import: no quoted-comma support, header row required.
// Expected columns: name,organization,type,url,deadline,discipline,feeAmount,awardAmount
function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export async function importOpportunitiesCsv(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const workspaceId = await currentWorkspaceId();
  const text = await file.text();
  const rows = parseCsv(text);

  await prisma.opportunity.createMany({
    data: rows
      .filter((r) => r.name)
      .map((r) => ({
        workspaceId,
        name: r.name,
        organization: r.organization || null,
        type: r.type || "grant",
        url: r.url || null,
        deadline: r.deadline ? new Date(r.deadline) : null,
        discipline: r.discipline || null,
        feeAmount: r.feeAmount ? Number(r.feeAmount) : null,
        awardAmount: r.awardAmount ? Number(r.awardAmount) : null,
      })),
  });
  revalidatePath("/opportunities");
}
