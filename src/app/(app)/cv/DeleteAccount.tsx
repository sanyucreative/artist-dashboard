"use client";

import { useRef, useState, useTransition } from "react";
import { deleteAccount } from "./accountActions";

export function DeleteAccount({ email }: { email: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount(value);
      // On success the action redirects and never returns.
      if (res?.error) setError(res.error);
    });
  }

  return (
    <section className="mt-12 border-t border-neutral-200 pt-6">
      <h2 className="text-sm font-medium text-neutral-900">Delete account</h2>
      <p className="mt-1 max-w-prose text-sm text-neutral-600">
        Permanently deletes your account and everything in it: projects, opportunities, applications, assets, tasks and
        profile entries. This can&apos;t be undone.
      </p>
      <button
        type="button"
        onClick={() => {
          setValue("");
          setError(null);
          dialogRef.current?.showModal();
        }}
        className="mt-3 rounded-md px-3 py-1.5 text-sm font-medium text-red-700 shadow-[inset_0_0_0_1px_#fca5a5] hover:bg-red-50"
      >
        Delete my account
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-[0_8px_30px_rgba(15,15,15,0.15)] backdrop:bg-black/30"
      >
        <form onSubmit={submit} className="p-5">
          <h2 className="text-base font-semibold">Delete your account?</h2>
          <p className="mt-1 text-sm text-neutral-600">
            All of your data will be deleted for good. To confirm, type your email address:{" "}
            <span className="font-medium text-neutral-900">{email}</span>
          </p>
          <label htmlFor="confirm-email" className="sr-only">
            Type your email to confirm
          </label>
          <input
            id="confirm-email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            className="mt-3 w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm"
          />
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={pending || value.trim().toLowerCase() !== email.toLowerCase()}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {pending ? "Deleting..." : "Delete everything"}
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className="btn-secondary btn-sm">
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
