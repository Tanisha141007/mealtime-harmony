import { SLOT_ORDER, type MealSlot } from "./recipes";
import type { DayPlan, Prefs, Recipe } from "./planner";

export const DEMO_MODE = import.meta.env["VITE_DEMO_AUTH"] === "true";

export const demoPrefs: Prefs = {
  household: 4,
  location: "Kochi, Kerala",
  city: "Kochi",
  state: "Kerala",
  dietType: "veg",
  dislikes: ["bitter gourd"],
  allergies: ["peanut"],
  cuisines: ["Kerala", "Tamil Nadu", "Punjabi"],
  cookName: "Radha",
  cookPhone: "+919812345678",
  channel: "sms",
  leadHours: 12,
  notes: "- More high-protein breakfasts\n- No repeated dals more than once a week",
  linkCode: "K7M4Q2",
  cookLinked: true,
};

export const demoRecipes: Recipe[] = [
  {
    id: "masala_dosa",
    name: "Masala dosa",
    region: "Tamil Nadu",
    slots: ["breakfast"],
    diet: "veg",
    category: "carb",
    season: "all",
    minutes: 30,
    art: "dosa",
    ingredients: [
      { name: "dosa batter", qty: 1, unit: "cup" },
      { name: "potato masala", qty: 0.75, unit: "cup" },
    ],
  },
  {
    id: "kerala_sambar_rice",
    name: "Kerala sambar + red rice",
    region: "Kerala",
    slots: ["lunch", "dinner"],
    diet: "veg",
    category: "mixed",
    season: "monsoon",
    minutes: 35,
    art: "curry",
    ingredients: [
      { name: "toor dal", qty: 0.25, unit: "cup" },
      { name: "mixed vegetables", qty: 1, unit: "cup" },
      { name: "red rice", qty: 0.5, unit: "cup" },
      { name: "tamarind", qty: 0.5, unit: "tbsp" },
    ],
  },
  {
    id: "masala_chai_poha",
    name: "Masala chai + poha",
    region: "Maharashtra",
    slots: ["snack"],
    diet: "veg",
    category: "carb",
    season: "all",
    minutes: 15,
    art: "chai",
    ingredients: [
      { name: "poha", qty: 0.5, unit: "cup" },
      { name: "tea", qty: 1, unit: "cup" },
    ],
  },
  {
    id: "palak_paneer_phulka",
    name: "Palak paneer + phulka",
    region: "Punjab",
    slots: ["dinner"],
    diet: "veg",
    category: "protein",
    season: "winter",
    minutes: 40,
    art: "thali",
    ingredients: [
      { name: "paneer", qty: 100, unit: "g" },
      { name: "spinach", qty: 1.5, unit: "cup" },
      { name: "phulka", qty: 2, unit: "pc" },
    ],
  },
  {
    id: "appam_stew",
    name: "Appam stew",
    region: "Kerala",
    slots: ["breakfast", "dinner"],
    diet: "veg",
    category: "mixed",
    season: "all",
    minutes: 30,
    art: "dosa",
    ingredients: [
      { name: "appam batter", qty: 1, unit: "cup" },
      { name: "vegetable stew", qty: 1, unit: "cup" },
    ],
  },
  {
    id: "moong_chilla",
    name: "Moong chilla",
    region: "North India",
    slots: ["breakfast", "snack"],
    diet: "vegan",
    category: "protein",
    season: "all",
    minutes: 18,
    art: "dosa",
    ingredients: [
      { name: "moong dal", qty: 0.5, unit: "cup" },
      { name: "ginger", qty: 0.5, unit: "tsp" },
    ],
  },
  {
    id: "avial",
    name: "Avial",
    region: "Kerala",
    slots: ["lunch", "dinner"],
    diet: "veg",
    category: "vegetable",
    season: "summer",
    minutes: 25,
    art: "curry",
    ingredients: [
      { name: "mixed vegetables", qty: 1.25, unit: "cup" },
      { name: "coconut", qty: 0.25, unit: "cup" },
    ],
  },
];

const start = new Date();
start.setDate(start.getDate() - start.getDay() + 1);

function recipeAt(index: number): Recipe {
  const recipe = demoRecipes[index];
  if (!recipe) throw new Error(`Missing demo recipe at index ${index}`);
  return recipe;
}

const recipeForSlot: Record<MealSlot, Recipe> = {
  breakfast: recipeAt(0),
  lunch: recipeAt(1),
  snack: recipeAt(2),
  dinner: recipeAt(3),
};

export const demoWeek: DayPlan[] = Array.from({ length: 7 }, (_, offset) => {
  const date = new Date(start);
  date.setDate(start.getDate() + offset);
  return {
    date: date.toISOString().slice(0, 10),
    meals: SLOT_ORDER.map((slot) => ({
      slot,
      recipeId: recipeForSlot[slot].id,
      recipe: recipeForSlot[slot],
    })),
  };
});

export function demoSwapRecipe(slot: MealSlot): Recipe {
  if (slot === "breakfast") return recipeAt(5);
  if (slot === "lunch") return recipeAt(6);
  if (slot === "snack") return recipeAt(5);
  return recipeAt(4);
}
