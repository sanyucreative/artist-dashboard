import { PROJECT_STATUSES, titleCase } from "@/lib/constants";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ProjectFields({
  project,
}: {
  project?: {
    title: string;
    workingTitle: string | null;
    status: string;
    description: string | null;
    startDate: Date | null;
    medium: string | null;
    themes: string;
    isOngoing: boolean;
  };
}) {
  const p = project;
  const themesArray: string[] = p ? JSON.parse(p.themes || "[]") : [];
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";
  const label = "block text-xs text-neutral-500 mb-1";

  return (
    <>
      <label className={label}>
        Title
        <input name="title" defaultValue={p?.title} required className={input} />
      </label>
      <label className={label}>
        Working title
        <input name="workingTitle" defaultValue={p?.workingTitle ?? ""} className={input} />
      </label>
      <label className={label}>
        Status
        <select name="status" defaultValue={p?.status ?? "active"} className={input}>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Medium
        <input name="medium" defaultValue={p?.medium ?? ""} className={input} />
      </label>
      <label className={label}>
        Start date
        <input type="date" name="startDate" defaultValue={toDateInputValue(p?.startDate)} className={input} />
      </label>
      <label className="flex items-center gap-2 pt-5 text-xs text-neutral-600">
        <input type="checkbox" name="isOngoing" defaultChecked={p?.isOngoing} />
        Ongoing (never nudge toward &quot;complete&quot;)
      </label>
      <label className={label + " col-span-2"}>
        Themes (comma-separated)
        <input name="themes" defaultValue={themesArray.join(", ")} className={input} />
      </label>
      <label className={label + " col-span-2"}>
        Description
        <textarea name="description" defaultValue={p?.description ?? ""} rows={3} className={input} />
      </label>
    </>
  );
}
