"use client";

import { useState } from "react";
import { createAsset } from "./actions";
import { AssetFields } from "./AssetFields";

export function NewAssetForm({ projects }: { projects: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        + New asset
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-neutral-200 p-4">
      <form
        action={async (formData) => {
          await createAsset(formData);
          setOpen(false);
        }}
        className="grid grid-cols-2 gap-3"
      >
        <AssetFields projects={projects} />
        <div className="col-span-2 flex gap-2">
          <button type="submit" className="btn-primary">
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
