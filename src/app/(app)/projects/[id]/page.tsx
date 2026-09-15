import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "./ProjectHeader";
import { ParticipantList } from "./ParticipantList";
import { MilestoneList } from "./MilestoneList";
import { ExhibitionHistory } from "./ExhibitionHistory";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { createdAt: "asc" } },
      milestones: { orderBy: { dueDate: "asc" } },
      assets: { orderBy: { createdAt: "desc" } },
      cvEntries: { orderBy: { date: "desc" } },
      applications: { include: { application: { include: { opportunity: true } } } },
    },
  });

  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/projects" className="text-sm text-neutral-500 hover:underline">
        ← Projects
      </Link>

      <div className="mt-2">
        <ProjectHeader project={project} />
      </div>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Participants</h2>
        <ParticipantList projectId={project.id} participants={project.participants} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Milestones</h2>
        <MilestoneList projectId={project.id} milestones={project.milestones} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Assets</h2>
        {project.assets.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No assets linked yet. Link one from the <Link href="/assets" className="underline">Asset library</Link>.
          </p>
        ) : (
          <ul className="space-y-1">
            {project.assets.map((a) => (
              <li key={a.id}>
                <Link href="/assets" className="text-sm text-blue-700 hover:underline">
                  {a.title}
                </Link>
                {a.version && <span className="ml-2 text-xs text-neutral-400">({a.version})</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Exhibition history</h2>
        <ExhibitionHistory projectId={project.id} entries={project.cvEntries} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-700">Applications drawing on this project</h2>
        {project.applications.length === 0 ? (
          <p className="text-sm text-neutral-500">None yet.</p>
        ) : (
          <ul className="space-y-1">
            {project.applications.map((ap) => (
              <li key={ap.applicationId}>
                <Link href={`/applications/${ap.applicationId}`} className="text-sm text-blue-700 hover:underline">
                  {ap.application.opportunity.name}
                </Link>
                <span className="ml-2 text-xs text-neutral-500">
                  {APPLICATION_STATUS_LABELS[ap.application.status] ?? ap.application.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
