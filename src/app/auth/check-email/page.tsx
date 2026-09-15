export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Check your email</h1>
      <p className="text-sm text-neutral-500">
        A sign-in link is on its way. In local dev, no real email is sent — look at the terminal running{" "}
        <code>npm run dev</code> for the link instead.
      </p>
    </main>
  );
}
