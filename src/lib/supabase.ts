import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"];
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

if (!url || !anonKey) {
  // Fails loudly at startup rather than a confusing runtime error the
  // first time someone tries to sign in.
  console.error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set - copy .env.example to .env.local and fill them in.",
  );
}

// Fall back to a syntactically valid placeholder so the app (a visual
// prototype without a backend yet) still boots; auth calls simply fail.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "public-anon-key-placeholder",
);
