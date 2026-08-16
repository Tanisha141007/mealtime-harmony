import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "./api";
import { supabase } from "./supabase";
import { DEMO_MODE } from "./demo";

type AuthResult = { error: string | null; needsConfirmation?: boolean };

type Ctx = {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const demoSession = {
    access_token: "demo-access-token",
    token_type: "bearer",
    user: { id: "demo-user", email: "demo@example.com" },
  } as Session;
  const [session, setSession] = useState<Session | null>(DEMO_MODE ? demoSession : null);
  const [loading, setLoading] = useState(!DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (event === "SIGNED_IN" && newSession) {
        sendWelcomeEmail().catch((error) => console.warn("ahaar welcome email failed", error));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    if (DEMO_MODE) return { error: null };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data.session) {
      setSession(data.session);
      sendWelcomeEmail().catch((error) => console.warn("ahaar welcome email failed", error));
    }
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    if (DEMO_MODE) return { error: null };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        // Without this, Google silently re-authenticates whatever Google
        // account is already logged into the browser (its own session
        // cookie, separate from ours) instead of showing the account
        // picker - so signing out of the app and back in again looked
        // like it skipped straight past login instead of asking which
        // account to use.
        queryParams: { prompt: "select_account" },
      },
    });
    return { error: error?.message ?? null };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    if (DEMO_MODE) return { error: null };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (data.session) {
      setSession(data.session);
      sendWelcomeEmail().catch((error) => console.warn("ahaar welcome email failed", error));
    }
    return { error: error?.message ?? null, needsConfirmation: !data.session };
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setSession(demoSession);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, signInWithGoogle, signInWithPassword, signUpWithPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Access token used by src/lib/api.ts for authenticated backend calls. */
export function useAccessToken() {
  const { session } = useAuth();
  return session?.access_token ?? null;
}
