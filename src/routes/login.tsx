import { AhaarWordmark } from "@/components/AhaarLogo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — ahaar" }],
  }),
  component: Login,
});

function Login() {
  const { loading, session, signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/", replace: true });
    }
  }, [loading, navigate, session]);

  const submit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;
    if (mode === "sign-up" && password.length < 6) {
      toast.error("Use a longer password", { description: "Passwords need at least 6 characters." });
      return;
    }

    setBusy(true);
    const result =
      mode === "sign-in"
        ? await signInWithPassword(trimmedEmail, password)
        : await signUpWithPassword(trimmedEmail, password);
    setBusy(false);

    if (result.error) {
      toast.error(mode === "sign-in" ? "Couldn't sign in" : "Couldn't create account", {
        description: result.error,
      });
      return;
    }

    if (mode === "sign-up" && result.needsConfirmation) {
      toast.success("Account created", {
        description: "Confirm your email if Supabase asks for it, then sign in here.",
      });
      setMode("sign-in");
      setPassword("");
      return;
    }

    if (mode === "sign-up") {
      toast.success("Account created", { description: "You're signed in and ready to plan." });
    }
    navigate({ to: "/", replace: true });
  };

  if (loading || session) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="soft-card w-full max-w-sm p-6">
        <AhaarWordmark className="mb-5" />

        <Tabs value={mode} onValueChange={(value) => setMode(value as "sign-in" | "sign-up")}>
          <TabsList className="mb-5 grid w-full grid-cols-2 rounded-2xl bg-cream">
            <TabsTrigger value="sign-in" className="rounded-xl">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="sign-up" className="rounded-xl">
              Sign up
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <h1 className="text-2xl leading-tight">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          {mode === "sign-in"
            ? "Sign in with your email and password."
            : "Start planning meals with an email and password."}
        </p>

        <label className="text-sm font-bold" htmlFor="email">
          Email address
        </label>
        <div className="relative mt-1.5">
          <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-2xl bg-cream pl-9"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <label className="mt-4 block text-sm font-bold" htmlFor="password">
          Password
        </label>
        <div className="relative mt-1.5">
          <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "sign-in" ? "Your password" : "At least 6 characters"}
            className="rounded-2xl bg-cream pl-9"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <button
          onClick={submit}
          disabled={busy || !email.trim() || !password}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {mode === "sign-in" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
          {busy ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}
