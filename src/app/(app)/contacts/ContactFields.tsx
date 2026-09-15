import { RELATIONSHIP_TYPES, titleCase } from "@/lib/constants";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ContactFields({
  contact,
}: {
  contact?: {
    name: string;
    organization: string | null;
    role: string | null;
    email: string | null;
    phone: string | null;
    relationshipType: string | null;
    notes: string | null;
    lastContactedAt: Date | null;
  };
}) {
  const c = contact;
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";
  const label = "block text-xs text-neutral-500 mb-1";

  return (
    <>
      <label className={label}>
        Name
        <input name="name" defaultValue={c?.name} required className={input} />
      </label>
      <label className={label}>
        Relationship
        <select name="relationshipType" defaultValue={c?.relationshipType ?? ""} className={input}>
          <option value="">—</option>
          {RELATIONSHIP_TYPES.map((r) => (
            <option key={r} value={r}>
              {titleCase(r)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Organization
        <input name="organization" defaultValue={c?.organization ?? ""} className={input} />
      </label>
      <label className={label}>
        Role
        <input name="role" defaultValue={c?.role ?? ""} className={input} />
      </label>
      <label className={label}>
        Email
        <input type="email" name="email" defaultValue={c?.email ?? ""} className={input} />
      </label>
      <label className={label}>
        Phone
        <input name="phone" defaultValue={c?.phone ?? ""} className={input} />
      </label>
      <label className={label}>
        Last contacted
        <input type="date" name="lastContactedAt" defaultValue={toDateInputValue(c?.lastContactedAt)} className={input} />
      </label>
      <label className={label + " col-span-2"}>
        Notes
        <textarea name="notes" defaultValue={c?.notes ?? ""} rows={2} className={input} />
      </label>
    </>
  );
}
