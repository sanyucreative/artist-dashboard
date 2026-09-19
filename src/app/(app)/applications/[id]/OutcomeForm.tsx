"use client";

import { OUTCOMES, OUTCOME_REASON_CODES, OUTCOME_REASON_LABELS, titleCase } from "@/lib/constants";
import { setOutcome } from "./actions";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function OutcomeForm({
  applicationId,
  outcome,
}: {
  applicationId: string;
  outcome: {
    outcome: string | null;
    outcomeReasonCode: string | null;
    outcomeReason: string | null;
    feedbackReceived: string | null;
    canReapply: boolean;
    reapplyDate: Date | null;
    retro: string | null;
  };
}) {
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";
  const label = "block text-xs text-neutral-500 mb-1";

  return (
    <form action={(formData) => setOutcome(applicationId, formData)} className="grid grid-cols-2 gap-3">
      <label className={label}>
        Outcome
        <select name="outcome" defaultValue={outcome.outcome ?? ""} className={input}>
          <option value="">Not decided</option>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {titleCase(o)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Reason code
        <select name="outcomeReasonCode" defaultValue={outcome.outcomeReasonCode ?? ""} className={input}>
          <option value="">—</option>
          {OUTCOME_REASON_CODES.map((c) => (
            <option key={c} value={c}>
              {OUTCOME_REASON_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <label className={label + " col-span-2"}>
        Reason (free text)
        <textarea name="outcomeReason" defaultValue={outcome.outcomeReason ?? ""} rows={2} className={input} />
      </label>
      <label className={label + " col-span-2"}>
        Feedback received
        <textarea name="feedbackReceived" defaultValue={outcome.feedbackReceived ?? ""} rows={2} className={input} />
      </label>
      <label className="flex items-center gap-2 text-xs text-neutral-600">
        <input type="checkbox" name="canReapply" defaultChecked={outcome.canReapply} />
        Can reapply
      </label>
      <label className={label}>
        Reapply date
        <input type="date" name="reapplyDate" defaultValue={toDateInputValue(outcome.reapplyDate)} className={input} />
      </label>
      <label className={label + " col-span-2"}>
        What I&apos;d change next time
        <textarea name="retro" defaultValue={outcome.retro ?? ""} rows={2} className={input} />
      </label>
      <div className="col-span-2">
        <button type="submit" className="btn-primary">
          Save outcome
        </button>
      </div>
    </form>
  );
}
