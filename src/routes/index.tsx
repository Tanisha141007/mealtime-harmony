import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BellRing, CheckCircle2, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MealCard } from "@/components/MealCard";
import { DishArt } from "@/components/DishArt";
import { usePlanner } from "@/lib/planner";
import { SLOT_LABEL, SLOT_ORDER, SLOT_TIME, byId } from "@/lib/recipes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caspian — Meal Planner & Cook Coordination" },
      {
        name: "description",
        content:
          "Plan your household's Indian meals for the week and keep your cook in the loop with dish, ingredients and servings.",
      },
      { property: "og:title", content: "Caspian — Meal Planner & Cook Coordination" },
      {
        property: "og:description",
        content: "A warm weekly meal planner for Indian households, with automatic cook updates.",
      },
    ],
  }),
  component: Planner,
});

function Planner() {
  const { week, today, selected, setSelected, swap, nextMeal, prefs, scaled } = usePlanner();
  const [swapping, setSwapping] = useState<string | null>(null);

  const day = week.find((d) => d.date === selected) ?? week[0]!;
  const hero = nextMeal.recipe;
  const heroIngredients = scaled(hero).slice(0, 4);

  const handleSwap = (slot: (typeof SLOT_ORDER)[number]) => {
    setSwapping(slot);
    const next = swap(day.date, slot);
    setTimeout(() => setSwapping(null), 500);
    toast.success(`Swapped ${SLOT_LABEL[slot].toLowerCase()}`, { description: next.name });
  };

  return (
    <AppShell>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Good day, Tanisha</p>
          <h1 className="mt-0.5 text-3xl leading-tight">This week's table</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
          <Users className="size-3.5" /> {prefs.household}
        </span>
      </header>

      {/* Hero: next meal */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground">
        <div className="absolute -top-14 -right-14 size-52 bg-primary-foreground/12 blob" />
        <div className="relative flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-widest uppercase opacity-85">
              Next up · {SLOT_LABEL[nextMeal.slot]} · {SLOT_TIME[nextMeal.slot]}
            </p>
            <h2 className="mt-2 text-3xl leading-tight">{hero.name}</h2>
            <p className="mt-1 text-sm font-semibold opacity-90">
              {hero.region} · {hero.minutes} min · {prefs.household} servings
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {heroIngredients.map((ing) => (
                <span
                  key={ing.name}
                  className="rounded-full bg-primary-foreground/18 px-2.5 py-1 text-xs font-semibold"
                >
                  {ing.name} {ing.qty}
                  {ing.unit}
                </span>
              ))}
            </div>
          </div>
          <DishArt art={hero.art} alt={hero.name} priority className="size-24 shrink-0 sm:size-28" />
        </div>

        <div className="relative mt-5 flex items-center gap-2 rounded-2xl bg-primary-foreground/16 px-3.5 py-3 text-sm font-semibold">
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {prefs.cookName} notified on {prefs.channel === "whatsapp" ? "WhatsApp" : "SMS"} ·
            delivered
          </span>
          <button
            onClick={() =>
              toast(`Reminder queued for ${prefs.cookName}`, {
                description: `${hero.name} · ${prefs.household} servings · ${prefs.leadHours}h ahead`,
              })
            }
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold text-primary"
          >
            <BellRing className="size-3" /> Resend
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
        {SLOT_ORDER.map((slot) => {
          const meal = day.meals.find((m) => m.slot === slot);
          if (!meal) return null;
          return (
            <MealCard
              key={slot}
              slot={slot}
              recipe={byId(meal.recipeId)}
              swapping={swapping === slot}
              onSwap={() => handleSwap(slot)}
            />
          );
        })}
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Tap the arrows to swap a single meal — the rest of the week stays put.
        </p>
      </section>
    </AppShell>
  );
}
