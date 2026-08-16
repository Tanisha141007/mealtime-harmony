import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, CheckCircle2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AhaarMark } from "@/components/AhaarLogo";
import { MealCard } from "@/components/MealCard";
import { DishArt } from "@/components/DishArt";
import { Progress } from "@/components/ui/progress";
import { usePlanner } from "@/lib/planner";
import { notifyCook } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";
import { SLOT_LABEL, SLOT_ORDER, SLOT_TIME } from "@/lib/recipes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ahaar — Meal Planner & Cook Coordination" },
      {
        name: "description",
        content:
          "Plan your household's Indian meals for the week and keep your cook in the loop with dish, ingredients and servings.",
      },
      { property: "og:title", content: "ahaar — Meal Planner & Cook Coordination" },
      {
        property: "og:description",
        content: "A warm weekly meal planner for Indian households, with automatic cook updates.",
      },
    ],
  }),
  component: Planner,
});

function Planner() {
  const {
    householdId,
    hasHousehold,
    loadingHousehold,
    week,
    loadingWeek,
    today,
    selected,
    setSelected,
    swap,
    nextMeal,
    prefs,
    generateWeek,
    generatingWeek,
  } = usePlanner();
  const [swapping, setSwapping] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [showGenerateProgress, setShowGenerateProgress] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);

  useEffect(() => {
    if (!showGenerateProgress) return;

    const timer = window.setInterval(() => {
      setGenerateProgress((current) => {
        if (current >= 92) return current;
        return Math.min(current + (current < 55 ? 9 : 4), 92);
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, [showGenerateProgress]);

  if (loadingHousehold) {
    return (
      <AppShell>
        <p className="pt-10 text-center text-sm text-muted-foreground">Loading...</p>
      </AppShell>
    );
  }

  if (!hasHousehold) {
    return (
      <AppShell>
        <div className="soft-card mt-10 p-6 text-center">
          <h1 className="text-2xl">Set up your household first</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Head to Preferences to tell us about your household - diet, allergies, cook's details -
            before planning a week.
          </p>
          <Link
            to="/preferences"
            className="mt-4 inline-block rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Go to Preferences
          </Link>
        </div>
      </AppShell>
    );
  }

  const day = week.find((d) => d.date === selected) ?? week[0];
  const hero = nextMeal?.recipe;

  const handleSwap = async (slot: (typeof SLOT_ORDER)[number]) => {
    setSwapping(slot);
    try {
      const next = await swap(day!.date, slot);
      if (next)
        toast.success(`Swapped ${SLOT_LABEL[slot].toLowerCase()}`, { description: next.name });
    } catch (e) {
      toast.error("Couldn't swap that meal", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSwapping(null);
    }
  };

  const handleGenerate = async () => {
    setShowGenerateProgress(true);
    setGenerateProgress(8);
    try {
      await Promise.all([
        generateWeek(),
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ]);
      setGenerateProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      toast.success("This week's plan is ready");
    } catch (e) {
      toast.error("Couldn't generate a plan", { description: e instanceof Error ? e.message : undefined });
      setGenerateProgress(0);
    } finally {
      setShowGenerateProgress(false);
    }
  };

  const handleNotify = async () => {
    if (DEMO_MODE) {
      toast.info("Demo mode only", {
        description: "No cook message was sent from this local preview.",
      });
      return;
    }
    if (!householdId) return;
    // Sends whichever single meal is shown as "Next up" in the hero card
    // above (nextMeal - same logic, so this always matches what's on
    // screen): if it's 8pm and dinner's still ahead, that's dinner, not
    // tomorrow's breakfast; once dinner's cutoff passes, it rolls to
    // tomorrow's first meal automatically.
    if (!nextMeal) {
      toast.error("No upcoming meal to notify about", { description: "Generate a plan first." });
      return;
    }
    setNotifying(true);
    try {
      await notifyCook(householdId, nextMeal.date, nextMeal.slot);
      toast.success(`${prefs.cookName} notified`, {
        description: `Sent ${SLOT_LABEL[nextMeal.slot].toLowerCase()}${nextMeal.date === today ? "" : " (tomorrow)"}.`,
      });
    } catch (e) {
      toast.error("Couldn't send it", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setNotifying(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Good day</p>
          <h1 className="mt-0.5 text-3xl leading-tight">This week's table</h1>
        </div>
        <AhaarMark className="hidden size-11 drop-shadow-[0_8px_18px_oklch(0.29_0.045_52/0.14)] sm:block" />
      </header>

      {!hero || !day ? (
        <div className="soft-card p-6 text-center">
          <Sparkles className="mx-auto size-6 text-primary" />
          <h2 className="mt-2 text-xl">No plan for this week yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate one and I'll fill breakfast through dinner for every day.
          </p>
          <button
            onClick={handleGenerate}
            disabled={showGenerateProgress || generatingWeek}
            className="mt-4 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {showGenerateProgress || generatingWeek ? "Generating..." : "Generate weekly plan"}
          </button>
          {showGenerateProgress && (
            <div className="mx-auto mt-5 max-w-xs text-left">
              <Progress value={generateProgress} className="h-2.5 bg-secondary" />
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Building meals</span>
                <span>{generateProgress}%</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero: next meal */}
          <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground">
            <div className="absolute -top-14 -right-14 size-52 bg-primary-foreground/12 blob" />
            <div className="relative flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-widest uppercase opacity-85">
                  Next up · {SLOT_LABEL[nextMeal!.slot]} · {SLOT_TIME[nextMeal!.slot]}
                </p>
                <h2 className="mt-2 text-3xl leading-tight">{hero.name}</h2>
                <p className="mt-1 text-sm font-semibold opacity-90">
                  {hero.region} · {hero.minutes} min · {prefs.household} servings
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-primary-foreground/18 px-2.5 py-1 text-xs font-semibold">
                    Protein {hero.nutrition.protein}g
                  </span>
                  <span className="rounded-full bg-primary-foreground/18 px-2.5 py-1 text-xs font-semibold">
                    Carbs {hero.nutrition.carbs}g
                  </span>
                  <span className="rounded-full bg-primary-foreground/18 px-2.5 py-1 text-xs font-semibold">
                    Fat {hero.nutrition.fat}g
                  </span>
                  <span className="rounded-full bg-primary-foreground/18 px-2.5 py-1 text-xs font-semibold">
                    {hero.nutrition.calories} kcal
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] font-medium opacity-70">Estimated, per person</p>
              </div>
              <DishArt
                art={hero.art}
                alt={hero.name}
                priority
                className="size-24 shrink-0 sm:size-28"
              />
            </div>

            <div className="relative mt-5 flex items-center gap-2 rounded-2xl bg-primary-foreground/16 px-3.5 py-3 text-sm font-semibold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {prefs.cookLinked
                  ? `${prefs.cookName} linked for cook updates`
                  : `${prefs.cookName} hasn't linked yet - share code ${prefs.linkCode}`}
              </span>
              <button
                onClick={handleNotify}
                disabled={notifying || !prefs.cookLinked}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold text-primary disabled:opacity-60"
              >
                <BellRing className="size-3" /> {notifying ? "Sending..." : "Notify me"}
              </button>
            </div>
          </section>

          {/* Week strip */}
          <section className="mt-7">
            <h2 className="mb-3 text-xl">Your week</h2>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {week.map((d) => {
                const date = new Date(d.date);
                const active = d.date === selected;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelected(d.date)}
                    className={
                      "flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-3xl border px-2 py-3 transition-colors " +
                      (active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary")
                    }
                  >
                    <span className="text-[11px] font-bold uppercase">
                      {date.toLocaleDateString("en-IN", { weekday: "short" })}
                    </span>
                    <span className="font-display text-xl font-bold">{date.getDate()}</span>
                    {d.date === today && (
                      <span className="size-1.5 rounded-full bg-current opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Day meals */}
          <section className="mt-6 space-y-3">
            <h2 className="text-xl">
              {selected === today
                ? "Today's meals"
                : new Date(selected).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
            </h2>
            {loadingWeek && <p className="text-sm text-muted-foreground">Loading...</p>}
            {SLOT_ORDER.map((slot) => {
              const meal = day.meals.find((m) => m.slot === slot);
              if (!meal) return null;
              return (
                <MealCard
                  key={slot}
                  slot={slot}
                  recipe={meal.recipe}
                  swapping={swapping === slot}
                  onSwap={() => handleSwap(slot)}
                />
              );
            })}
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Tap the arrows to swap a single meal — the rest of the week stays put.
            </p>
          </section>
        </>
      )}
    </AppShell>
  );
}
