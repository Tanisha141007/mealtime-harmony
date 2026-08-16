import { supabase } from "./supabase";

const BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8001";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // body wasn't JSON - keep statusText
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Types (mirror app/api/serializers.py's output shape) ----

export type ApiDiet = "veg" | "vegan" | "egg" | "nonveg";
export type ApiCategory = "protein" | "carb" | "vegetable" | "mixed";
export type ApiSeason = "summer" | "monsoon" | "winter" | "all";
export type ApiArt = "curry" | "dosa" | "thali" | "chai";

export type ApiNutrition = { protein: number; carbs: number; fat: number; calories: number };

export type ApiRecipe = {
  id: string;
  name: string;
  region: string;
  slots: string[];
  diet: ApiDiet;
  category: ApiCategory;
  season: ApiSeason;
  minutes: number;
  art: ApiArt;
  ingredients: { name: string; qty: number; unit: string }[];
  // Per-serving estimate (app/nutrition.py - keyword-matched against
  // standard per-100g values, not a real nutrition database).
  nutrition: ApiNutrition;
};

export type ApiHousehold = {
  id: number;
  household: number;
  location: string;
  city: string;
  state: string;
  dietType: string;
  dislikes: string[];
  allergies: string[];
  cuisines: string[];
  cookName: string;
  cookPhone: string;
  channel: "sms" | "whatsapp";
  leadHours: number;
  notes: string;
  linkCode: string;
  cookLinked: boolean;
};

export type HouseholdInput = {
  name: string;
  cook_name: string;
  cook_phone: string;
  city?: string;
  state?: string;
  diet_type?: string;
  family_size?: number;
  kids_count?: number;
  spice_level?: string;
  allergies?: string[];
  disliked_ingredients?: string[];
  preferred_cuisines?: string[];
  notes?: string;
  preferred_channel?: string;
  lead_hours?: number;
};

export type ApiMeal = {
  slot: string;
  recipeId: string;
  dishRecipeIds: string[];
  servings: number;
  note: string;
  /** Combo dishes (e.g. dal + rice + roti) collapsed into one renderable
   * Recipe - ingredients are per-serving, scale client-side same as before. */
  recipe: ApiRecipe;
};

export type ApiDayPlan = {
  date: string;
  meals: ApiMeal[];
};

// ---- Households ----

export const getMyHousehold = () => request<ApiHousehold>("/api/households/me");

export const createHousehold = (body: HouseholdInput) =>
  request<ApiHousehold>("/api/households", { method: "POST", body: JSON.stringify(body) });

export const updateHousehold = (id: number, body: Partial<HouseholdInput>) =>
  request<ApiHousehold>(`/api/households/${id}`, { method: "PATCH", body: JSON.stringify(body) });

// ---- Plan ----

export const getWeek = (householdId: number, weekStart?: string) =>
  request<ApiDayPlan[]>(
    `/api/households/${householdId}/plan${weekStart ? `?week_start=${weekStart}` : ""}`,
  );

export const generateWeek = (householdId: number, weekStart?: string) =>
  request<ApiDayPlan[]>(`/api/households/${householdId}/plan/generate`, {
    method: "POST",
    body: JSON.stringify({ week_start: weekStart ?? null }),
  });

export const assignMeal = (householdId: number, date: string, slot: string, recipeId: string) =>
  request<ApiDayPlan>(`/api/households/${householdId}/plan/assign`, {
    method: "POST",
    body: JSON.stringify({ date, slot, recipe_id: recipeId }),
  });

export const swapMeal = (householdId: number, date: string, slot: string, hint = "") =>
  request<ApiDayPlan>(`/api/households/${householdId}/plan/swap`, {
    method: "POST",
    body: JSON.stringify({ date, slot, hint }),
  });

// ---- Recipes (Discover) ----

export type RecipeFilters = {
  slot?: string;
  season?: string;
  category?: string;
  cuisine_style?: string;
  max_minutes?: number;
  limit?: number;
};

export const listRecipes = (householdId: number, filters: RecipeFilters = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return request<ApiRecipe[]>(`/api/households/${householdId}/recipes${qs ? `?${qs}` : ""}`);
};

// ---- Ask AI ----

export const askAi = (householdId: number, message: string) =>
  request<{ reply: string; notes_append: string; notes: string }>(
    `/api/households/${householdId}/ask-ai`,
    { method: "POST", body: JSON.stringify({ message }) },
  );

// ---- Notify cook ----

export const notifyCook = (householdId: number, date?: string) =>
  request<{ sent: boolean; message_preview: string }>(`/api/households/${householdId}/notify-cook`, {
    method: "POST",
    body: JSON.stringify({ date: date ?? null }),
  });
