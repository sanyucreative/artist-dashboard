"use client";

import { useState, useTransition } from "react";
import { clearFollowUp, deleteContact, toggleContactOpportunity, toggleContactProject, updateContact } from "./actions";
import { ContactFields } from "./ContactFields";
import { titleCase } from "@/lib/constants";
import { formatFullDate } from "@/lib/format";

export type ContactData = {
  id: string;
  name: string;
  organization: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  relationshipType: string | null;
  notes: string | null;
  lastContactedAt: Date | null;
  tags: string;
  nextFollowUpDate: Date | null;
  followUpNote: string | null;
  opportunities: { opportunityId: string }[];
  projects: { projectId: string }[];
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function ContactRow({
  contact,
  opportunities,
  projects,
}: {
  contact: ContactData;
  opportunities: { id: string; name: string }[];
  projects: { id: string; title: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const linkedOpportunityIds = new Set(contact.opportunities.map((o) => o.opportunityId));
  const linkedProjectIds = new Set(contact.projects.map((p) => p.projectId));
  const tags: string[] = JSON.parse(contact.tags || "[]");
  const isOverdue = contact.nextFollowUpDate && contact.nextFollowUpDate < startOfToday();

  if (editing) {
    return (
      <li className="px-4 py-4">
        <form
          action={async (formData) => {
            await updateContact(contact.id, formData);
            setEditing(false);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <ContactFields contact={contact} />
          <div className="col-span-2 flex items-center gap-2">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-neutral-500">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this contact?")) startTransition(() => deleteContact(contact.id));
              }}
              className="ml-auto text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="flex-1 text-left" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900">{contact.name}</span>
            {contact.relationshipType && (
              <span className="tag tag-gray">
                {titleCase(contact.relationshipType)}
              </span>
            )}
            {tags.map((tag) => (
              <span key={tag} className="tag tag-blue">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            {[contact.organization, contact.role].filter(Boolean).join(" · ") || "No organization"}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-xs text-neutral-500 hover:underline">
              Email
            </a>
          )}
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-neutral-500">
            Edit
          </button>
        </div>
      </div>

      {contact.nextFollowUpDate && (
        <div
          className={`mt-2 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs ${
            isOverdue ? "bg-amber-50 text-amber-800" : "bg-neutral-50 text-neutral-600"
          }`}
        >
          <span>
            Follow up {formatFullDate(contact.nextFollowUpDate)}
            {contact.followUpNote && <>: {contact.followUpNote}</>}
          </span>
          <form action={() => clearFollowUp(contact.id)}>
            <button type="submit" className="shrink-0 text-neutral-500 hover:text-neutral-700">
              Done
            </button>
          </form>
        </div>
      )}

      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-3">
          <div>
            <p className="mb-1 text-xs font-medium text-neutral-600">Linked opportunities</p>
            {opportunities.length === 0 ? (
              <p className="text-xs text-neutral-500">No opportunities yet.</p>
            ) : (
              <ul className="space-y-1">
                {opportunities.map((o) => {
                  const linked = linkedOpportunityIds.has(o.id);
                  return (
                    <li key={o.id}>
                      <label className="flex items-center gap-2 text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={linked}
                          disabled={isPending}
                          onChange={() => startTransition(() => toggleContactOpportunity(contact.id, o.id, linked))}
                        />
                        {o.name}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-neutral-600">Linked projects</p>
            {projects.length === 0 ? (
              <p className="text-xs text-neutral-500">No projects yet.</p>
            ) : (
              <ul className="space-y-1">
                {projects.map((p) => {
                  const linked = linkedProjectIds.has(p.id);
                  return (
                    <li key={p.id}>
                      <label className="flex items-center gap-2 text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={linked}
                          disabled={isPending}
                          onChange={() => startTransition(() => toggleContactProject(contact.id, p.id, linked))}
                        />
                        {p.title}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {contact.notes && <p className="col-span-2 text-xs text-neutral-500">{contact.notes}</p>}
        </div>
      )}
    </li>
  );
}
