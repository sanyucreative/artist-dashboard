"use client";

import { useState, useTransition } from "react";
import { addEligibilityCriterion, deleteEligibilityCriterion, toggleEligibilityCriterion } from "./actions";

export type EligibilityCriterionData = { id: string; label: string; checked: boolean };

export function EligibilityChecklist({
  opportunityId,
  criteria,
}: {
  opportunityId: string;
  criteria: EligibilityCriterionData[];
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const doneCount = criteria.filter((c) => c.checked).length;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-600">Eligibility checklist</p>
        {criteria.length > 0 && (
          <span className="text-[11px] text-neutral-500">
            {doneCount}/{criteria.length} verified
          </span>
        )}
      </div>
      {criteria.length === 0 ? (
        <p className="mb-1 text-sm text-neutral-500">Nothing to verify yet.</p>
      ) : (
        <ul className="mb-1 space-y-1">
          {criteria.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={c.checked}
                  disabled={isPending}
                  onChange={() => startTransition(() => toggleEligibilityCriterion(opportunityId, c.id, c.checked))}
                />
                <span className={c.checked ? "text-neutral-400 line-through" : ""}>{c.label}</span>
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                if (confirm("Remove this criterion?")) startTransition(() => deleteEligibilityCriterion(opportunityId, c.id));
              }}
                className="text-[11px] text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          action={async (formData) => {
            await addEligibilityCriterion(opportunityId, formData);
            setDraft("");
            setAdding(false);
          }}
          className="flex items-center gap-2"
        >
          <input
            name="label"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. 2+ years documented public practice"
            className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
            autoFocus
          />
          <button type="submit" className="btn-primary btn-sm">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)} className="text-xs text-neutral-500">
            Cancel
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-neutral-500 hover:text-neutral-900">
          + Add a criterion
        </button>
      )}
    </div>
  );
}
