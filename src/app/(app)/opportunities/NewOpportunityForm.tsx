"use client";

import { useState, useTransition } from "react";
import { Link2, Loader2 } from "lucide-react";
import { createOpportunity } from "./actions";
import { OpportunityFields, type OpportunityFieldsData } from "./OpportunityFields";
import { fetchOpportunityMetadataFromUrl } from "./fetchMetadata";

export function NewOpportunityForm() {
  const [open, setOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [prefill, setPrefill] = useState<OpportunityFieldsData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white"
      >
        + New opportunity
      </button>
    );
  }

  function handleFetch() {
    setFetchError(null);
    startTransition(async () => {
      const result = await fetchOpportunityMetadataFromUrl(linkUrl);
      if ("error" in result) {
        setFetchError(result.error);
        return;
      }
      setPrefill({
        name: result.name ?? "",
        organization: result.organization,
        type: "grant",
        url: linkUrl,
        deadline: result.deadline ? new Date(result.deadline) : null,
        notifyAt: null,
        feeAmount: result.feeAmount,
        awardAmount: result.awardAmount,
        discipline: null,
        eligibilityNotes: null,
        isRecurring: false,
        recurrenceCadence: null,
      });
    });
  }

  return (
    <div className="w-full rounded-lg border border-neutral-200 p-4">
      <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
        <label className="mb-1 flex items-center gap-1.5 text-xs text-neutral-600">
          <Link2 size={13} strokeWidth={2} /> Paste a link to a grant or competition to autofill what it can find
        </label>
        <div className="flex gap-2">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={!linkUrl || pending}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 disabled:opacity-50"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Autofill
          </button>
        </div>
        {fetchError && <p className="mt-1.5 text-xs text-red-600">{fetchError}</p>}
        {prefill && !fetchError && (
          <p className="mt-1.5 text-xs text-neutral-500">
            Filled in from the page. The deadline and amounts are best guesses, so check them before saving.
          </p>
        )}
      </div>

      <form
        action={async (formData) => {
          await createOpportunity(formData);
          setOpen(false);
        }}
        className="grid grid-cols-2 gap-3"
      >
        <OpportunityFields key={prefill ? linkUrl : "blank"} opportunity={prefill ?? undefined} />
        <div className="col-span-2 flex gap-2">
          <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
            Create
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
