import { CV_CATEGORIES, titleCase } from "@/lib/constants";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function CVEntryFields({
  entry,
}: {
  entry?: {
    category: string;
    title: string;
    organization: string | null;
    location: string | null;
    date: Date | null;
    description: string | null;
    isPublic: boolean;
  };
}) {
  const e = entry;
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";
  const label = "block text-xs text-neutral-500 mb-1";

  return (
    <>
      <label className={label}>
        Title
        <input name="title" defaultValue={e?.title} required className={input} />
      </label>
      <label className={label}>
        Category
        <select name="category" defaultValue={e?.category ?? "exhibition"} className={input}>
          {CV_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {titleCase(c)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Organization / venue
        <input name="organization" defaultValue={e?.organization ?? ""} className={input} />
      </label>
      <label className={label}>
        Location
        <input name="location" defaultValue={e?.location ?? ""} className={input} />
      </label>
      <label className={label}>
        Date
        <input type="date" name="date" defaultValue={toDateInputValue(e?.date)} className={input} />
      </label>
      <label className="flex items-center gap-2 pt-5 text-xs text-neutral-600">
        <input type="checkbox" name="isPublic" defaultChecked={e?.isPublic ?? true} />
        Include in exports
      </label>
      <label className={label + " col-span-2"}>
        Description
        <textarea name="description" defaultValue={e?.description ?? ""} rows={2} className={input} />
      </label>
    </>
  );
}
