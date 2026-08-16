import { AhaarMark } from "@/components/AhaarLogo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in - ahaar" }],
  }),
  component: Login,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.76-.07-1.49-.2-2.18H12v4.12h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.48Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.29l-3.24-2.52c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 14.03A6 6 0 0 1 6.1 12c0-.7.11-1.39.31-2.03v-2.6H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.63l3.34-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.85c1.47 0 2.8.51 3.84 1.5l2.86-2.86A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.37l3.34 2.6C7.21 7.61 9.4 5.85 12 5.85Z"
      />
    </svg>
  );
}

function Login() {
  const { loading, session, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/", replace: true });
    }
  }, [loading, navigate, session]);

  const submit = async () => {
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);

    if (result.error) {
      toast.error("Couldn't sign in with Google", { description: result.error });
    }
  };

  if (loading || session) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <AhaarMark className="size-20" />
        <h1 className="font-display mt-4 text-5xl font-bold lowercase leading-none text-foreground">ahaar</h1>

        <button
          onClick={submit}
          disabled={busy}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-cream disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? "Opening Google..." : "Sign in with Google"}
        </button>
      </section>
    </main>
  );
}
