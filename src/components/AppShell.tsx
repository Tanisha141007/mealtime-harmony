import { AhaarWordmark } from "@/components/AhaarLogo";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarHeart, Compass, LogOut, SlidersHorizontal } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const TABS = [
  { to: "/preferences", label: "Preferences", icon: SlidersHorizontal },
  { to: "/", label: "Planner", icon: CalendarHeart },
  { to: "/discover", label: "Discover", icon: Compass },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    // Same background as everywhere else so this doesn't flash - just
    // renders nothing while we either check the session or redirect.
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background sm:flex">
      {/* Wide screens: left rail */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-2 border-r border-border bg-cream px-4 py-8 sm:flex">
        <AhaarWordmark className="mb-6 px-2" />
        {TABS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
            activeProps={{ className: "bg-primary/12 !text-primary" }}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/login" });
          }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="size-5" />
          Sign out
        </button>
        <p className="mt-auto px-3 text-xs leading-relaxed text-muted-foreground">
          Prototype — meals, cook messages and AI replies are simulated.
        </p>
      </aside>

      <main className="mx-auto w-full max-w-2xl px-5 pt-6 pb-32 sm:pb-16">{children}</main>

      {/* Mobile: floating tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-5 pb-5 sm:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-between rounded-4xl border border-border bg-card/95 p-2 shadow-[0_16px_40px_-20px_oklch(0.29_0.045_52/0.55)] backdrop-blur">
          {TABS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-1 flex-col items-center gap-1 rounded-3xl px-2 py-2.5 text-[11px] font-bold text-muted-foreground transition-colors"
              activeProps={{ className: "bg-primary !text-primary-foreground" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <p className="text-sm font-semibold text-primary">{subtitle}</p>
      <h1 className="mt-1 text-3xl leading-tight">{title}</h1>
    </header>
  );
}
