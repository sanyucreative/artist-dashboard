"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteOpportunity, startApplication, updateOpportunity } from "./actions";
import { APPLICATION_STATUS_LABELS, OPPORTUNITY_TYPE_TAG_COLORS, titleCase } from "@/lib/constants";
import { formatFullDate } from "@/lib/format";
import { OpportunityFields } from "./OpportunityFields";
import { EligibilityChecklist, type EligibilityCriterionData } from "./EligibilityChecklist";

export type OpportunityRowData = {
  id: string;
  name: string;
  organization: string | null;
  type: string;
  url: string | null;
  deadline: Date | null;
  feeAmount: number | null;
  awardAmount: number | null;
  discipline: string | null;
  eligibilityNotes: string | null;
  isRecurring: boolean;
  recurrenceCadence: string | null;
  applications: { id: string; status: string; submittedAt: Date | null }[];
  eligibilityCriteria: EligibilityCriterionData[];
};

function formatDeadline(date: Date | null) {
  if (!date) return "no deadline";
  return formatFullDate(date);
}

export function OpportunityRow({ opportunity }: { opportunity: OpportunityRowData }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="px-4 py-4">
        <form
          action={async (formData) => {
            await updateOpportunity(opportunity.id, formData);
            setEditing(false);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <OpportunityFields opportunity={opportunity} />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-neutral-500">
              Cancel
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
            <span className="text-sm font-medium text-neutral-900">{opportunity.name}</span>
            <span className={`tag ${OPPORTUNITY_TYPE_TAG_COLORS[opportunity.type] ?? "tag-gray"}`}>
              {titleCase(opportunity.type)}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {opportunity.organization ?? "No organization"} · {formatDeadline(opportunity.deadline)}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {opportunity.url && (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 hover:underline"
            >
              Link
            </a>
          )}
          <form action={() => startApplication(opportunity.id)}>
            <button type="submit" className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700">
              Apply
            </button>
          </form>
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-neutral-500">
            Edit
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3">
          {opportunity.eligibilityNotes && (
            <div>
              <p className="text-xs font-medium text-neutral-600">Eligibility notes</p>
              <p className="text-sm text-neutral-700">{opportunity.eligibilityNotes}</p>
            </div>
          )}
          <EligibilityChecklist opportunityId={opportunity.id} criteria={opportunity.eligibilityCriteria} />
          <div>
            <p className="text-xs font-medium text-neutral-600">Past applications</p>
            {opportunity.applications.length === 0 ? (
              <p className="text-sm text-neutral-500">None yet.</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {opportunity.applications.map((a) => (
                  <li key={a.id}>
                    <Link href={`/applications/${a.id}`} className="text-sm text-blue-700 hover:underline">
                      {APPLICATION_STATUS_LABELS[a.status] ?? a.status}
                    </Link>
                    {a.submittedAt && (
                      <span className="ml-2 text-xs text-neutral-500">
                        submitted {new Date(a.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <form
            action={async () => {
              await deleteOpportunity(opportunity.id);
            }}
          >
            <button type="submit" className="text-xs text-red-600 hover:underline">
              Delete opportunity
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
