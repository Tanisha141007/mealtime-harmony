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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
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
    <AuthContext.Provider value={{ session, loading, signInWithPassword, signUpWithPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** M4 will use this to attach the bearer token to every API call. */
export function useAccessToken() {
  const { session } = useAuth();
  return session?.access_token ?? null;
}
