"use client";

import { useState } from "react";
import { importOpportunitiesCsv } from "./actions";

export function CsvImportForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-neutral-500 hover:text-neutral-900">
        Import CSV
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await importOpportunitiesCsv(formData);
        setOpen(false);
      }}
      className="flex items-center gap-2"
    >
      <input type="file" name="file" accept=".csv,text/csv" required className="text-xs" />
      <button type="submit" className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700">
        Upload
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500">
        Cancel
      </button>
      <span className="text-[11px] text-neutral-500">columns: name,organization,type,url,deadline,discipline,feeAmount,awardAmount</span>
    </form>
  );
}
