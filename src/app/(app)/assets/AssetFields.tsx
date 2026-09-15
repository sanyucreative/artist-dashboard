import { ASSET_TYPES, ASSET_TYPE_LABELS } from "@/lib/constants";

export function AssetFields({
  asset,
  projects,
}: {
  asset?: {
    type: string;
    title: string;
    fileUrl: string | null;
    version: string | null;
    projectId: string | null;
    notes: string | null;
  };
  projects: { id: string; title: string }[];
}) {
  const a = asset;
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";
  const label = "block text-xs text-neutral-500 mb-1";

  return (
    <>
      <label className={label}>
        Title
        <input name="title" defaultValue={a?.title} required className={input} />
      </label>
      <label className={label}>
        Type
        <select name="type" defaultValue={a?.type ?? "other"} className={input}>
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {ASSET_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Version
        <input name="version" defaultValue={a?.version ?? ""} placeholder="e.g. 2026-v2" className={input} />
      </label>
      <label className={label}>
        Project
        <select name="projectId" defaultValue={a?.projectId ?? ""} className={input}>
          <option value="">Not linked to a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <label className={label + " col-span-2"}>
        File / link URL
        <input name="fileUrl" defaultValue={a?.fileUrl ?? ""} className={input} />
      </label>
      <label className={label + " col-span-2"}>
        Notes
        <textarea name="notes" defaultValue={a?.notes ?? ""} rows={2} className={input} />
      </label>
    </>
  );
}
