import Link from "next/link";
import { PageHeader } from "../PageHeader";
import { Image } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { titleCase, PROJECT_STATUS_TAG_COLORS } from "@/lib/constants";
import { NewProjectForm } from "./NewProjectForm";

export default async function ProjectsPage() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { participants: true, applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader title="Projects" icon={Image}>
        <NewProjectForm />
      </PageHeader>

      {projects.length === 0 ? (
        <p className="text-sm text-neutral-500">No projects yet. Add your first body of work with the button above.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="widget-card block p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-900">{p.title}</span>
                <span className={`tag ${PROJECT_STATUS_TAG_COLORS[p.status] ?? "tag-gray"}`}>
                  {titleCase(p.status)}
                </span>
              </div>
              {p.medium && <p className="mb-2 text-xs text-neutral-500">{p.medium}</p>}
              <p className="text-xs text-neutral-500">
                {p._count.participants} participant{p._count.participants === 1 ? "" : "s"} ·{" "}
                {p._count.applications} application{p._count.applications === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
