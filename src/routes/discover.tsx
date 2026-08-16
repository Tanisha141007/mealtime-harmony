import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DishArt } from "@/components/DishArt";
import { DietDot } from "@/components/DietDot";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePlanner, type Recipe } from "@/lib/planner";
import { listRecipes, type RecipeFilters } from "@/lib/api";
import { SLOT_LABEL, SLOT_ORDER, type MealSlot } from "@/lib/recipes";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Dishes — Caspian" },
      {
        name: "description",
        content:
          "Browse seasonal picks, high-protein dishes and regional favourites, and drop them straight into your week.",
      },
      { property: "og:title", content: "Discover Dishes — Caspian" },
      {
        property: "og:description",
        content: "Regional Indian meal suggestions you can add to any slot in your plan.",
      },
    ],
  }),
  component: Discover,
});

// Best-effort state -> cuisine_style, matching the states offered as chips
// in Preferences - only needed for the "Popular in..." row's filter.
const STATE_TO_CUISINE_STYLE: Record<string, string> = {
  Kerala: "kerala",
  "Tamil Nadu": "tamil",
  Punjab: "punjabi",
  Gujarat: "gujarati",
  Maharashtra: "maharashtrian",
  "West Bengal": "bengali",
  Rajasthan: "rajasthani",
  "Andhra Pradesh": "andhra",
  Goa: "goan",
  Karnataka: "karnataka",
};

function useRecipeRow(householdId: number | null, title: string, filters: RecipeFilters) {
  const query = useQuery({
    queryKey: ["recipes", householdId, filters],
    queryFn: () => listRecipes(householdId as number, filters),
    enabled: !!householdId,
  });
  return { title, items: query.data ?? [], loading: query.isLoading };
}

function Discover() {
  const { householdId, prefs, week, assign, today } = usePlanner();
  const [picked, setPicked] = useState<Recipe | null>(null);

  const cuisineStyle = STATE_TO_CUISINE_STYLE[prefs.state];
  const regionLabel = prefs.state || "your region";

  const rows = [
    useRecipeRow(householdId, "Seasonal picks", { season: "monsoon", limit: 8 }),
    useRecipeRow(householdId, "High protein", { category: "protein", limit: 8 }),
    useRecipeRow(householdId, "Quick to cook", { max_minutes: 20, limit: 8 }),
    useRecipeRow(householdId, `Popular in ${regionLabel}`, { ...(cuisineStyle ? { cuisine_style: cuisineStyle } : {}), limit: 8 }),
    useRecipeRow(householdId, "Carb-rich comfort", { category: "carb", limit: 8 }),
    useRecipeRow(householdId, "Veg-forward", { category: "vegetable", limit: 8 }),
  ].filter((row) => cuisineStyle || row.title !== `Popular in ${regionLabel}`);

  const addTo = async (slot: MealSlot, date: string) => {
    if (!picked) return;
    try {
      await assign(date, slot, picked.id);
      toast.success(`${picked.name} added`, {
        description: `${SLOT_LABEL[slot]} · ${new Date(date).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "short",
        })}`,
      });
    } catch (e) {
      toast.error("Couldn't add that", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setPicked(null);
    }
  };

  if (!householdId) {
    return (
      <AppShell>
        <PageHeader title="Discover dishes" subtitle="Something new for the table" />
        <p className="text-sm text-muted-foreground">Set up your household in Preferences first.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Discover dishes" subtitle="Something new for the table" />

      <div className="space-y-8">
        {rows.map((row) => (
          <section key={row.title}>
            <h2 className="mb-3 text-xl">{row.title}</h2>
            {row.loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : row.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            ) : (
              <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                {row.items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setPicked(r)}
                    className="soft-card w-44 shrink-0 p-3 text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div className="grid h-24 w-full place-items-center rounded-2xl bg-cream">
                      <DishArt art={r.art} alt={r.name} className="size-20" />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <DietDot diet={r.diet} />
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                        <Clock className="size-3" /> {r.minutes}m
                      </span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-base leading-snug">{r.name}</h3>
                    <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{r.region}</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-bold text-primary">
                      <Plus className="size-3" /> Add to plan
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <Sheet open={!!picked} onOpenChange={(o) => !o && setPicked(null)}>
        <SheetContent side="bottom" className="rounded-t-4xl border-border">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">{picked?.name}</SheetTitle>
            <SheetDescription>
              {picked?.region} · {picked?.minutes} min · scaled for {prefs.household} servings
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-8">
            <p className="text-sm font-bold">Add to a slot</p>
            <div className="grid grid-cols-2 gap-2">
              {SLOT_ORDER.filter((s) => picked?.slots.includes(s)).map((slot) => (
                <button
                  key={slot}
                  onClick={() => addTo(slot, today)}
                  className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
                >
                  Today · {SLOT_LABEL[slot]}
                </button>
              ))}
              {SLOT_ORDER.filter((s) => picked?.slots.includes(s)).map((slot) => (
                <button
                  key={`t-${slot}`}
                  onClick={() => addTo(slot, week[1]?.date ?? today)}
                  className="rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground"
                >
                  Tomorrow · {SLOT_LABEL[slot]}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
