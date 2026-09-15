"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteAsset, updateAsset } from "./actions";
import { AssetFields } from "./AssetFields";
import { ASSET_TYPE_LABELS, VISUAL_ASSET_TYPES } from "@/lib/constants";

export type AssetCardData = {
  id: string;
  type: string;
  title: string;
  fileUrl: string | null;
  version: string | null;
  projectId: string | null;
  notes: string | null;
  project: { title: string } | null;
  usedIn: { application: { opportunity: { name: string }; id: string } }[];
};

export function AssetCard({
  asset,
  projects,
  variant = "list",
}: {
  asset: AssetCardData;
  projects: { id: string; title: string }[];
  variant?: "grid" | "list";
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-lg border border-neutral-200 p-3">
        <form
          action={async (formData) => {
            await updateAsset(asset.id, formData);
            setEditing(false);
          }}
          className="grid grid-cols-2 gap-2"
        >
          <AssetFields asset={asset} projects={projects} />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-neutral-500">
              Cancel
            </button>
            <form action={() => deleteAsset(asset.id)} className="ml-auto">
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Delete
              </button>
            </form>
          </div>
        </form>
      </div>
    );
  }

  const isVisual = VISUAL_ASSET_TYPES.has(asset.type);

  return (
    <div className={`rounded-lg border border-neutral-200 p-3 ${variant === "grid" ? "" : "flex items-start justify-between gap-3"}`}>
      {variant === "grid" && isVisual && (
        <div className="mb-2 flex h-32 items-center justify-center rounded bg-neutral-50 text-xs text-neutral-400">
          {asset.fileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.fileUrl} alt={asset.title} className="max-h-32 max-w-full rounded object-cover" />
          ) : (
            "No file linked"
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-neutral-900">{asset.title}</span>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">
            {ASSET_TYPE_LABELS[asset.type] ?? asset.type}
          </span>
          {asset.version && <span className="text-xs text-neutral-400">{asset.version}</span>}
        </div>
        {asset.project && <p className="text-xs text-neutral-500">Project: {asset.project.title}</p>}
        {asset.notes && <p className="text-xs text-neutral-500">{asset.notes}</p>}
        {asset.usedIn.length > 0 && (
          <p className="mt-1 text-xs text-neutral-500">
            Used in:{" "}
            {asset.usedIn.map((u, i) => (
              <span key={u.application.id}>
                {i > 0 && ", "}
                <Link href={`/applications/${u.application.id}`} className="text-blue-700 hover:underline">
                  {u.application.opportunity.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
      <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-xs text-neutral-500 hover:text-neutral-900">
        Edit
      </button>
    </div>
  );
}
