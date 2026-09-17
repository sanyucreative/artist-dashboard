import { OPPORTUNITY_TYPES, titleCase } from "@/lib/constants";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function OpportunityFields({
  opportunity,
}: {
  opportunity?: {
    name: string;
    organization: string | null;
    type: string;
    url: string | null;
    deadline: Date | null;
    notifyAt: Date | null;
    feeAmount: number | null;
    awardAmount: number | null;
    discipline: string | null;
    eligibilityNotes: string | null;
    isRecurring: boolean;
    recurrenceCadence: string | null;
  };
}) {
  const o = opportunity;
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";
  const label = "block text-xs text-neutral-500 mb-1";

  return (
    <>
      <label className={label}>
        Name
        <input name="name" defaultValue={o?.name} required className={input} />
      </label>
      <label className={label}>
        Organization
        <input name="organization" defaultValue={o?.organization ?? ""} className={input} />
      </label>
      <label className={label}>
        Type
        <select name="type" defaultValue={o?.type ?? "grant"} className={input}>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {titleCase(t)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Discipline
        <input name="discipline" defaultValue={o?.discipline ?? ""} className={input} />
      </label>
      <label className={label}>
        Deadline
        <input type="date" name="deadline" defaultValue={toDateInputValue(o?.deadline)} className={input} />
      </label>
      <label className={label}>
        Remind me on
        <input type="date" name="notifyAt" defaultValue={toDateInputValue(o?.notifyAt)} className={input} />
      </label>
      <label className={label}>
        URL
        <input name="url" defaultValue={o?.url ?? ""} className={input} />
      </label>
      <label className={label}>
        Application fee ($)
        <input type="number" step="0.01" name="feeAmount" defaultValue={o?.feeAmount ?? ""} className={input} />
      </label>
      <label className={label}>
        Award amount ($)
        <input type="number" step="0.01" name="awardAmount" defaultValue={o?.awardAmount ?? ""} className={input} />
      </label>
      <label className="col-span-2 flex items-center gap-2 text-xs text-neutral-600">
        <input type="checkbox" name="isRecurring" defaultChecked={o?.isRecurring} />
        Recurring opportunity
      </label>
      <label className={label + " col-span-2"}>
        Recurrence cadence
        <input name="recurrenceCadence" defaultValue={o?.recurrenceCadence ?? ""} placeholder="e.g. annual" className={input} />
      </label>
      <label className={label + " col-span-2"}>
        Eligibility notes
        <textarea name="eligibilityNotes" defaultValue={o?.eligibilityNotes ?? ""} rows={2} className={input} />
      </label>
    </>
  );
}
