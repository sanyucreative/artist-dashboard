"use client";

import { useState, useTransition } from "react";
import { addParticipant, deleteParticipant, updateParticipantConsent } from "../actions";
import { CONSENT_STATUSES, CONSENT_STATUS_LABELS } from "@/lib/constants";

type Participant = {
  id: string;
  name: string;
  role: string | null;
  contactEmail: string | null;
  consentStatus: string;
  notes: string | null;
};

const CONSENT_CHIP: Record<string, string> = {
  granted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-700",
  requested: "bg-blue-100 text-blue-700",
  not_requested: "bg-neutral-100 text-neutral-600",
};

export function ParticipantList({ projectId, participants }: { projectId: string; participants: Participant[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const input = "rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-full";

  return (
    <div>
      {participants.length === 0 ? (
        <p className="text-sm text-neutral-500">No participants yet.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {participants.map((p) => (
            <li key={p.id} className="rounded-md border border-neutral-200 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-medium text-neutral-900">{p.name}</span>
                  {p.role && <span className="ml-2 text-xs text-neutral-500">{p.role}</span>}
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteParticipant(projectId, p.id))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={p.consentStatus}
                  disabled={isPending}
                  onChange={(e) => startTransition(() => updateParticipantConsent(projectId, p.id, e.target.value))}
                  className={`rounded px-1.5 py-0.5 text-[11px] ${CONSENT_CHIP[p.consentStatus] ?? "bg-neutral-100"}`}
                >
                  {CONSENT_STATUSES.map((c) => (
                    <option key={c} value={c}>
                      {CONSENT_STATUS_LABELS[c]}
                    </option>
                  ))}
                </select>
                {p.notes && <span className="text-xs text-neutral-500">{p.notes}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          action={async (formData) => {
            await addParticipant(projectId, formData);
            setAdding(false);
          }}
          className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 p-3"
        >
          <input name="name" placeholder="Name" required className={input} />
          <input name="role" placeholder="Role" className={input} />
          <input name="contactEmail" placeholder="Contact email" className={input} />
          <select name="consentStatus" defaultValue="not_requested" className={input}>
            {CONSENT_STATUSES.map((c) => (
              <option key={c} value={c}>
                {CONSENT_STATUS_LABELS[c]}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notes" className={input + " col-span-2"} />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white">
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-neutral-500">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-sm text-neutral-500 hover:text-neutral-900">
          + Add participant
        </button>
      )}
    </div>
  );
}
