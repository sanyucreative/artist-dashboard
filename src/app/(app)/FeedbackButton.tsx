"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { submitFeedback } from "./feedbackActions";

export function FeedbackButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function open() {
    setError(null);
    setSent(false);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitFeedback(message, pathname ?? "");
      if ("error" in res) {
        setError(res.error);
      } else {
        setMessage("");
        setSent(true);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-black/[.05]"
      >
        <MessageSquare size={16} strokeWidth={2} className="shrink-0 text-neutral-500" />
        Send feedback
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-[0_8px_30px_rgba(15,15,15,0.15)] backdrop:bg-black/30"
      >
        <div className="p-5">
          {sent ? (
            <div>
              <h2 className="text-base font-semibold">Thank you</h2>
              <p className="mt-1 text-sm text-neutral-600">Your feedback was sent. It helps a lot.</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setSent(false)} className="btn-secondary btn-sm">
                  Send more
                </button>
                <button type="button" onClick={close} className="btn-primary btn-sm">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="text-base font-semibold">Send feedback</h2>
              <p className="mt-1 text-sm text-neutral-600">
                What&apos;s confusing, broken, or missing? We&apos;ll note which page you&apos;re on.
              </p>
              <label htmlFor="feedback-message" className="sr-only">
                Your feedback
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={4000}
                required
                autoFocus
                placeholder="I expected to..., but..."
                className="mt-3 w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm"
              />
              {error && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button type="submit" disabled={pending} className="btn-primary btn-sm">
                  {pending ? "Sending..." : "Send"}
                </button>
                <button type="button" onClick={close} className="btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
