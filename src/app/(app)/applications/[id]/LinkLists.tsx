"use client";

import { useTransition } from "react";
import { toggleAssetLink, toggleProjectLink } from "./actions";

export function ProjectLinker({
  applicationId,
  projects,
  linkedIds,
}: {
  applicationId: string;
  projects: { id: string; title: string }[];
  linkedIds: Set<string>;
}) {
  const [isPending, startTransition] = useTransition();

  if (projects.length === 0) return <p className="text-sm text-neutral-500">No projects in this workspace yet.</p>;

  return (
    <ul className="space-y-1">
      {projects.map((p) => {
        const linked = linkedIds.has(p.id);
        return (
          <li key={p.id}>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={linked}
                disabled={isPending}
                onChange={() => startTransition(() => toggleProjectLink(applicationId, p.id, linked))}
              />
              {p.title}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function AssetLinker({
  applicationId,
  assets,
  linkedIds,
}: {
  applicationId: string;
  assets: { id: string; title: string; type: string; version: string | null }[];
  linkedIds: Set<string>;
}) {
  const [isPending, startTransition] = useTransition();

  if (assets.length === 0) return <p className="text-sm text-neutral-500">No assets in this workspace yet.</p>;

  return (
    <ul className="space-y-1">
      {assets.map((a) => {
        const linked = linkedIds.has(a.id);
        return (
          <li key={a.id}>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={linked}
                disabled={isPending}
                onChange={() => startTransition(() => toggleAssetLink(applicationId, a.id, linked))}
              />
              {a.title}
              {a.version && <span className="text-xs text-neutral-500">({a.version})</span>}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
