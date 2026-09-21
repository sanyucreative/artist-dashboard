import { signIn } from "@/auth";
import { Palette } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { error } = await searchParams;
  const notInvited = error === "not-invited";
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-neutral-800 text-white">
          <Palette size={18} strokeWidth={2} />
        </span>
        <h1 className="text-xl font-semibold text-neutral-900">Plinth</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a sign-in link. No password needed.
        </p>
      </div>
      {notInvited && (
        <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          That email isn&apos;t on the invite list yet. Ask the person who invited you to add it, then try again.
        </p>
      )}
      <form
        action={async (formData) => {
          "use server";
          await signIn("nodemailer", formData);
        }}
        className="flex flex-col gap-3"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="btn-primary py-2"
        >
          Send magic link
        </button>
      </form>
    </main>
  );
}
