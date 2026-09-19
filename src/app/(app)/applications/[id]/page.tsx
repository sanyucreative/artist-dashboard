import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatFullDate } from "@/lib/format";
import { StatusStepper } from "./StatusStepper";
import { ProjectLinker, AssetLinker } from "./LinkLists";
import { OutcomeForm } from "./OutcomeForm";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      opportunity: true,
      projects: { include: { project: true } },
      assetsUsed: { include: { asset: true } },
    },
  });

  if (!application) notFound();

  const [projects, assets] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId: application.workspaceId }, orderBy: { title: "asc" } }),
    prisma.asset.findMany({ where: { workspaceId: application.workspaceId }, orderBy: { title: "asc" } }),
  ]);

  const linkedProjectIds = new Set(application.projects.map((p) => p.projectId));
  const linkedAssetIds = new Set(application.assetsUsed.map((a) => a.assetId));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Link href="/opportunities" className="text-sm text-neutral-500 hover:underline">
        ← Opportunities
      </Link>

      <h1 className="mt-2 mb-1 text-[28px] font-semibold tracking-tight text-neutral-900">{application.opportunity.name}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {application.opportunity.organization ?? "No organization"}
        {application.opportunity.deadline && (
          <> · deadline {formatFullDate(application.opportunity.deadline)}</>
        )}
      </p>

      <section className="mb-8">
        <StatusStepper applicationId={application.id} status={application.status} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Linked projects</h2>
        <ProjectLinker applicationId={application.id} projects={projects} linkedIds={linkedProjectIds} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Assets used</h2>
        <AssetLinker applicationId={application.id} assets={assets} linkedIds={linkedAssetIds} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Outcome</h2>
        <OutcomeForm key={application.updatedAt.toISOString()} applicationId={application.id} outcome={application} />
      </section>
    </main>
  );
}
