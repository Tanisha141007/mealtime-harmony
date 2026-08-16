// Recipe data now comes from the real API (src/lib/api.ts, src/lib/planner.tsx) -
// this file keeps only the small display constants still shared across
// components (slot labels/order/times, diet labels/dot colors).

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
export type Diet = "veg" | "vegan" | "egg" | "nonveg";

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const SLOT_TIME: Record<MealSlot, string> = {
  breakfast: "8:00 AM",
  lunch: "1:00 PM",
  snack: "5:00 PM",
  dinner: "8:30 PM",
};

export const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

export const DIET_LABEL: Record<Diet, string> = {
  veg: "Veg",
  vegan: "Vegan",
  egg: "Egg",
  nonveg: "Non-veg",
};
