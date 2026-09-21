import { auth } from "@/auth";
import { PageHeader } from "../PageHeader";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { RELATIONSHIP_TYPES, titleCase } from "@/lib/constants";
import { ContactRow, type ContactData } from "./ContactRow";
import { SearchClear } from "../SearchClear";
import { NewContactForm } from "./NewContactForm";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const relationshipType = typeof params.type === "string" ? params.type : "all";
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const [contacts, opportunities, projects] = await Promise.all([
    prisma.contact.findMany({
      where: {
        workspaceId: workspace.id,
        ...(relationshipType !== "all" ? { relationshipType } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { organization: { contains: q, mode: "insensitive" as const } },
                { email: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: { opportunities: true, projects: true },
      orderBy: { name: "asc" },
    }),
    prisma.opportunity.findMany({ where: { workspaceId: workspace.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { workspaceId: workspace.id }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader title="Contacts" icon={Users}>
        <NewContactForm />
      </PageHeader>

      {q && <SearchClear q={q} href="/contacts" />}

      <form className="mb-6 flex items-center gap-2" method="get">
        <select name="type" defaultValue={relationshipType} className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm" aria-label="Relationship type">
          <option value="all">All relationship types</option>
          {RELATIONSHIP_TYPES.map((r) => (
            <option key={r} value={r}>
              {titleCase(r)}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary btn-sm">
          Filter
        </button>
        <a href="/contacts" className="text-sm text-neutral-500 hover:text-neutral-800">
          Clear
        </a>
      </form>

      {contacts.length === 0 ? (
        <p className="text-sm text-neutral-500">No contacts match. Clear the filter, or add someone with the button above.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
          {contacts.map((c) => (
            <ContactRow key={c.id} contact={c as ContactData} opportunities={opportunities} projects={projects} />
          ))}
        </ul>
      )}
    </main>
  );
}
