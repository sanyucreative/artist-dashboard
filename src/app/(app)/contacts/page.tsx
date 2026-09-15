import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { RELATIONSHIP_TYPES, titleCase } from "@/lib/constants";
import { ContactRow, type ContactData } from "./ContactRow";
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

  const [contacts, opportunities, projects] = await Promise.all([
    prisma.contact.findMany({
      where: {
        workspaceId: workspace.id,
        ...(relationshipType !== "all" ? { relationshipType } : {}),
      },
      include: { opportunities: true, projects: true },
      orderBy: { name: "asc" },
    }),
    prisma.opportunity.findMany({ where: { workspaceId: workspace.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { workspaceId: workspace.id }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-2xl font-semibold text-neutral-900">Contacts</h1>
      <div className="mb-6 flex justify-end">
        <NewContactForm />
      </div>

      <form className="mb-6 flex items-center gap-2" method="get">
        <select name="type" defaultValue={relationshipType} className="rounded-md border border-neutral-300 px-2 py-1 text-xs">
          <option value="all">All relationship types</option>
          {RELATIONSHIP_TYPES.map((r) => (
            <option key={r} value={r}>
              {titleCase(r)}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs text-white">
          Filter
        </button>
        <a href="/contacts" className="text-xs text-neutral-400 hover:text-neutral-600">
          Clear
        </a>
      </form>

      {contacts.length === 0 ? (
        <p className="text-sm text-neutral-500">No contacts match this filter.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {contacts.map((c) => (
            <ContactRow key={c.id} contact={c as ContactData} opportunities={opportunities} projects={projects} />
          ))}
        </ul>
      )}
    </main>
  );
}
