import { AhaarWordmark } from "@/components/AhaarLogo";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — ahaar" }],
  }),
  component: Login,
});

function Login() {
  const { sendMagicLink } = useAuth();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await sendMagicLink(email.trim());
    setBusy(false);
    if (error) {
      toast.error("Couldn't send the link", { description: error });
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="soft-card w-full max-w-sm p-6">
        <AhaarWordmark className="mb-5" />

        {sent ? (
          <>
            <MailCheck className="size-8 text-primary" />
            <h1 className="mt-3 text-2xl leading-tight">Check your email</h1>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">
              We sent a sign-in link to <span className="font-semibold">{email}</span>. Open it on
              this device to continue.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-sm font-bold text-primary underline"
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl leading-tight">Sign in</h1>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">
              We'll email you a sign-in link - no password needed.
            </p>
            <label className="text-sm font-bold" htmlFor="email">
              Email address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-2xl bg-cream pl-9"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <button
              onClick={submit}
              disabled={busy}
              className="mt-4 w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send sign-in link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
