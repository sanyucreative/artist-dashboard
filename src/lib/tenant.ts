import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";

// Every workspace is one tenant. Server actions are public POST endpoints, so
// each one must (1) require a real session and (2) only touch rows that
// belong to the caller's workspace. Never look a record up by id alone.

export async function requireWorkspaceId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");
  const workspace = await getWorkspaceForUser(session.user.id);
  return workspace.id;
}

async function assert(found: number) {
  if (!found) throw new Error("Not found");
}

export const ownsOpportunity = async (workspaceId: string, id: string) =>
  assert(await prisma.opportunity.count({ where: { id, workspaceId } }));
export const ownsProject = async (workspaceId: string, id: string) =>
  assert(await prisma.project.count({ where: { id, workspaceId } }));
export const ownsApplication = async (workspaceId: string, id: string) =>
  assert(await prisma.application.count({ where: { id, workspaceId } }));
export const ownsAsset = async (workspaceId: string, id: string) =>
  assert(await prisma.asset.count({ where: { id, workspaceId } }));

// For an optional foreign key coming from a form (e.g. an asset's projectId):
// null passes, anything else must be in the caller's workspace.
export async function ownsProjectOrNull(workspaceId: string, id: string | null) {
  if (id) await ownsProject(workspaceId, id);
}
