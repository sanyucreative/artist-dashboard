"use client";

import { useTransition } from "react";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { setApplicationStatus } from "./actions";

export function StatusStepper({ applicationId, status }: { applicationId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const currentIndex = APPLICATION_STATUSES.indexOf(status as (typeof APPLICATION_STATUSES)[number]);

  return (
    <div className="flex items-center gap-1">
      {APPLICATION_STATUSES.map((s, i) => {
        const isCurrent = s === status;
        const isPast = i < currentIndex;
        return (
          <div key={s} className="flex items-center">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => setApplicationStatus(applicationId, s))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isCurrent
                  ? "bg-neutral-900 text-white"
                  : isPast
                    ? "bg-neutral-200 text-neutral-700"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {APPLICATION_STATUS_LABELS[s]}
            </button>
            {i < APPLICATION_STATUSES.length - 1 && <span className="mx-1 h-px w-3 bg-neutral-200" />}
          </div>
        );
      })}
    </div>
  );
}
