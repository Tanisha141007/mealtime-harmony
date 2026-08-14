import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { RECIPES, SLOT_ORDER, byId, type MealSlot, type Recipe } from "./recipes";

export type PlannedMeal = { slot: MealSlot; recipeId: string };
export type DayPlan = { date: string; meals: PlannedMeal[] };

export type Prefs = {
  household: number;
  location: string;
  diets: string[];
  dislikes: string[];
  allergies: string[];
  cuisines: string[];
  cookName: string;
  cookPhone: string;
  channel: "whatsapp" | "sms";
  leadHours: number;
};

const DEFAULT_PREFS: Prefs = {
  household: 4,
  location: "Kochi, Kerala",
  diets: ["Vegetarian-leaning", "High protein"],
  dislikes: ["Bitter gourd", "Raw onion"],
  allergies: ["Peanuts"],
  cuisines: ["Kerala", "Tamil Nadu", "Punjab"],
  cookName: "Lakshmi",
  cookPhone: "+91 98470 33121",
  channel: "whatsapp",
  leadHours: 12,
};

/** Deterministic, repetition-free week built from the recipe dataset. */
function buildWeek(startsOn: Date): DayPlan[] {
  const used = new Set<string>();
  const days: DayPlan[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(startsOn);
    date.setDate(startsOn.getDate() + d);
    const meals: PlannedMeal[] = SLOT_ORDER.map((slot) => {
      const pool = RECIPES.filter((r) => r.slots.includes(slot) && !used.has(r.id));
      const pick = pool[(d * 3 + SLOT_ORDER.indexOf(slot) * 5) % Math.max(pool.length, 1)];
      const chosen = pick ?? RECIPES.filter((r) => r.slots.includes(slot))[0];
      used.add(chosen.id);
      return { slot, recipeId: chosen.id };
    });
    days.push({ date: toKey(date), meals });
  }
  return days;
}

export const toKey = (d: Date) => d.toISOString().slice(0, 10);

type Ctx = {
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  week: DayPlan[];
  today: string;
  selected: string;
  setSelected: (d: string) => void;
  swap: (date: string, slot: MealSlot) => Recipe;
  assign: (date: string, slot: MealSlot, recipeId: string) => void;
  nextMeal: { date: string; slot: MealSlot; recipe: Recipe };
  scaled: (r: Recipe) => { name: string; qty: number; unit: string }[];
};

const PlannerContext = createContext<Ctx | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const start = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayKey = toKey(start);

  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [week, setWeek] = useState<DayPlan[]>(() => buildWeek(start));
  const [selected, setSelected] = useState(todayKey);

  const setPrefs = useCallback((p: Partial<Prefs>) => {
    setPrefsState((prev) => ({ ...prev, ...p }));
  }, []);

  const assign = useCallback((date: string, slot: MealSlot, recipeId: string) => {
    setWeek((prev) =>
      prev.map((day) =>
        day.date === date
          ? { ...day, meals: day.meals.map((m) => (m.slot === slot ? { ...m, recipeId } : m)) }
          : day,
      ),
    );
  }, []);

  const swap = useCallback(
    (date: string, slot: MealSlot) => {
      const inUse = new Set(week.flatMap((d) => d.meals.map((m) => m.recipeId)));
      const pool = RECIPES.filter((r) => r.slots.includes(slot) && !inUse.has(r.id));
      const fallback = RECIPES.filter((r) => r.slots.includes(slot));
      const next = pool.length ? pool[Math.floor(Math.random() * pool.length)] : fallback[Math.floor(Math.random() * fallback.length)];
      assign(date, slot, next.id);
      return next;
    },
    [week, assign],
  );

  const nextMeal = useMemo(() => {
    const hour = new Date().getHours();
    const upcoming = SLOT_ORDER.find(
      (s) => hour < { breakfast: 8, lunch: 13, snack: 17, dinner: 20 }[s],
    );
    const day = week.find((d) => d.date === todayKey) ?? week[0];
    if (upcoming) {
      const meal = day.meals.find((m) => m.slot === upcoming)!;
      return { date: day.date, slot: upcoming, recipe: byId(meal.recipeId) };
    }
    const tomorrow = week[1] ?? week[0];
    return { date: tomorrow.date, slot: "breakfast" as MealSlot, recipe: byId(tomorrow.meals[0].recipeId) };
  }, [week, todayKey]);

  const scaled = useCallback(
    (r: Recipe) => r.ingredients.map((ing) => ({ ...ing, qty: Math.round(ing.qty * prefs.household * 10) / 10 })),
    [prefs.household],
  );

  const value: Ctx = {
    prefs,
    setPrefs,
    week,
    today: todayKey,
    selected,
    setSelected,
    swap,
    assign,
    nextMeal,
    scaled,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside PlannerProvider");
  return ctx;
}
