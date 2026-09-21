"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceId, ownsApplication, ownsProject, ownsAsset } from "@/lib/tenant";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function dateVal(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? new Date(v) : null;
}

// CVEntry category by opportunity type -- close enough for v1; editable after.
const CV_CATEGORY_BY_TYPE: Record<string, string> = {
  grant: "award",
  award: "award",
  fellowship: "award",
  residency: "residency",
  exhibition_call: "exhibition",
  commission: "award",
  mentorship: "residency",
};

export async function setApplicationStatus(applicationId: string, status: string) {
  const workspaceId = await requireWorkspaceId();
  await ownsApplication(workspaceId, applicationId);
  const data: { status: string; submittedAt?: Date } = { status };
  if (status === "submitted") {
    const existing = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!existing?.submittedAt) data.submittedAt = new Date();
  }
  await prisma.application.update({ where: { id: applicationId }, data });
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
}

export async function setOutcome(applicationId: string, formData: FormData) {
  await ownsApplication(await requireWorkspaceId(), applicationId);
  const outcome = str(formData, "outcome");
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "decision",
      decisionAt: new Date(),
      outcome,
      outcomeReasonCode: str(formData, "outcomeReasonCode"),
      outcomeReason: str(formData, "outcomeReason"),
      feedbackReceived: str(formData, "feedbackReceived"),
      canReapply: formData.get("canReapply") === "on",
      reapplyDate: dateVal(formData, "reapplyDate"),
      retro: str(formData, "retro"),
    },
    include: { opportunity: true },
  });

  // Auto-create a CV entry when an application is accepted, per spec --
  // don't duplicate if this outcome was already accepted before (e.g. edited).
  if (outcome === "accepted") {
    const already = await prisma.cVEntry.findFirst({ where: { sourceApplicationId: applicationId } });
    if (!already) {
      await prisma.cVEntry.create({
        data: {
          workspaceId: application.workspaceId,
          category: CV_CATEGORY_BY_TYPE[application.opportunity.type] ?? "award",
          title: application.opportunity.name,
          organization: application.opportunity.organization,
          date: application.decisionAt,
          sourceApplicationId: applicationId,
          isPublic: true,
        },
      });
    }
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
}

export async function toggleProjectLink(applicationId: string, projectId: string, linked: boolean) {
  const workspaceId = await requireWorkspaceId();
  await ownsApplication(workspaceId, applicationId);
  await ownsProject(workspaceId, projectId);
  if (linked) {
    await prisma.applicationProject.delete({ where: { applicationId_projectId: { applicationId, projectId } } });
  } else {
    await prisma.applicationProject.create({ data: { applicationId, projectId } });
  }
  revalidatePath(`/applications/${applicationId}`);
}

export async function toggleAssetLink(applicationId: string, assetId: string, linked: boolean) {
  const workspaceId = await requireWorkspaceId();
  await ownsApplication(workspaceId, applicationId);
  await ownsAsset(workspaceId, assetId);
  if (linked) {
    await prisma.applicationAsset.delete({ where: { applicationId_assetId: { applicationId, assetId } } });
  } else {
    await prisma.applicationAsset.create({ data: { applicationId, assetId } });
  }
  revalidatePath(`/applications/${applicationId}`);
}
