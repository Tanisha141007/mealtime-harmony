import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  assignMeal,
  createHousehold as apiCreateHousehold,
  generateWeek as apiGenerateWeek,
  getMyHousehold,
  getWeek,
  swapMeal,
  updateHousehold as apiUpdateHousehold,
  type ApiDayPlan,
  type ApiHousehold,
  type ApiRecipe,
  type CookScheduleEntry,
  type HouseholdInput,
} from "./api";
import { useAuth } from "./auth";
import { DEMO_MODE, demoPrefs, demoSwapRecipe, demoWeek } from "./demo";
import { SLOT_ORDER, type MealSlot } from "./recipes";

export type Recipe = ApiRecipe;
export type PlannedMeal = { slot: MealSlot; recipeId: string; recipe: Recipe };
export type DayPlan = { date: string; meals: PlannedMeal[] };
export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type CookSchedule = Record<DayKey, CookScheduleEntry[]>;

export type Prefs = {
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
  channel: "whatsapp" | "sms";
  leadHours: number;
  notifyMe: boolean;
  notifyMeals: MealSlot[];
  sendTime: string;
  cookMessageSchedule: CookSchedule;
  notes: string;
  linkCode: string;
  cookLinked: boolean;
};

const DEFAULT_PREFS: Prefs = {
  household: 4,
  location: "",
  city: "",
  state: "",
  dietType: "veg",
  dislikes: [],
  allergies: [],
  cuisines: [],
  cookName: "",
  cookPhone: "",
  channel: "sms",
  leadHours: 12,
  notifyMe: false,
  notifyMeals: ["lunch", "snack", "dinner"],
  sendTime: "07:00",
  cookMessageSchedule: defaultCookSchedule(),
  notes: "",
  linkCode: "",
  cookLinked: false,
};

function defaultCookSchedule(): CookSchedule {
  return {
    monday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
    tuesday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
    wednesday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
    thursday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
    friday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
    saturday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
    sunday: [{ enabled: true, time: "09:00", meals: ["lunch"], message: "" }],
  };
}

export const toKey = (d: Date) => d.toISOString().slice(0, 10);

function apiHouseholdToPrefs(h: ApiHousehold): Prefs {
  return {
    household: h.household,
    location: h.location,
    city: h.city,
    state: h.state,
    dietType: h.dietType,
    dislikes: h.dislikes,
    allergies: h.allergies,
    cuisines: h.cuisines,
    cookName: h.cookName,
    cookPhone: h.cookPhone,
    channel: h.channel,
    leadHours: h.leadHours,
    notifyMe: h.notifyMe,
    notifyMeals: h.notifyMeals as MealSlot[],
    sendTime: h.sendTime,
    cookMessageSchedule: { ...defaultCookSchedule(), ...(h.cookMessageSchedule as Partial<CookSchedule>) },
    notes: h.notes,
    linkCode: h.linkCode,
    cookLinked: h.cookLinked,
  };
}

function prefsToHouseholdInput(p: Partial<Prefs>): Partial<HouseholdInput> {
  const out: Partial<HouseholdInput> = {};
  if (p.household !== undefined) out.family_size = p.household;
  if (p.city !== undefined) out.city = p.city;
  if (p.state !== undefined) out.state = p.state;
  if (p.dietType !== undefined) out.diet_type = p.dietType;
  if (p.dislikes !== undefined) out.disliked_ingredients = p.dislikes;
  if (p.allergies !== undefined) out.allergies = p.allergies;
  if (p.cuisines !== undefined) out.preferred_cuisines = p.cuisines;
  if (p.cookName !== undefined) out.cook_name = p.cookName;
  if (p.cookPhone !== undefined) out.cook_phone = p.cookPhone;
  if (p.channel !== undefined) out.preferred_channel = p.channel;
  if (p.leadHours !== undefined) out.lead_hours = p.leadHours;
  if (p.notifyMe !== undefined) out.notify_me = p.notifyMe;
  if (p.notifyMeals !== undefined) out.notify_meals = p.notifyMeals;
  if (p.sendTime !== undefined) out.send_time = p.sendTime;
  if (p.cookMessageSchedule !== undefined) out.cook_message_schedule = p.cookMessageSchedule;
  if (p.notes !== undefined) out.notes = p.notes;
  return out;
}

type Ctx = {
  householdId: number | null;
  hasHousehold: boolean;
  loadingHousehold: boolean;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  createHousehold: (input: HouseholdInput) => Promise<void>;
  creatingHousehold: boolean;

  week: DayPlan[];
  loadingWeek: boolean;
  today: string;
  selected: string;
  setSelected: (d: string) => void;

  generateWeek: () => Promise<void>;
  generatingWeek: boolean;

  swap: (date: string, slot: MealSlot) => Promise<Recipe | null>;
  assign: (date: string, slot: MealSlot, recipeId: string) => Promise<void>;

  nextMeal: { date: string; slot: MealSlot; recipe: Recipe } | null;
  scaled: (r: Recipe) => { name: string; qty: number; unit: string }[];
  scaledNutrition: (r: Recipe) => Recipe["nutrition"];
};

const PlannerContext = createContext<Ctx | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => toKey(new Date()), []);
  const [selected, setSelected] = useState(todayKey);
  const [demoPrefsState, setDemoPrefsState] = useState<Prefs>(demoPrefs);
  const [demoWeekState, setDemoWeekState] = useState<DayPlan[]>(demoWeek);

  const isAuthed = DEMO_MODE || !!session;

  const householdQuery = useQuery({
    queryKey: ["household", "me"],
    queryFn: getMyHousehold,
    enabled: isAuthed && !DEMO_MODE,
    retry: (failureCount, error) => (error instanceof ApiError && error.status === 404 ? false : failureCount < 2),
  });

  const hasHousehold = DEMO_MODE || (householdQuery.isSuccess && !!householdQuery.data);
  const household = householdQuery.data ?? null;
  const householdId = DEMO_MODE ? 1 : household?.id ?? null;
  const prefs = DEMO_MODE ? demoPrefsState : household ? apiHouseholdToPrefs(household) : DEFAULT_PREFS;

  const weekQuery = useQuery({
    queryKey: ["week", householdId],
    queryFn: () => getWeek(householdId as number),
    enabled: !!householdId && !DEMO_MODE,
  });
  const week: DayPlan[] = DEMO_MODE
    ? demoWeekState
    : (weekQuery.data ?? []).map((d: ApiDayPlan) => ({
        date: d.date,
        meals: d.meals.map((m) => ({ slot: m.slot as MealSlot, recipeId: m.recipeId, recipe: m.recipe })),
      }));

  const invalidateWeek = () => queryClient.invalidateQueries({ queryKey: ["week", householdId] });

  const createMutation = useMutation({
    mutationFn: (input: HouseholdInput) => apiCreateHousehold(input),
    onSuccess: (h) => queryClient.setQueryData(["household", "me"], h),
  });
  const createHousehold = useCallback(
    async (input: HouseholdInput) => {
      await createMutation.mutateAsync(input);
    },
    [createMutation],
  );

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<Prefs>) => apiUpdateHousehold(householdId as number, prefsToHouseholdInput(patch)),
    onSuccess: (h) => queryClient.setQueryData(["household", "me"], h),
  });
  const setPrefs = useCallback(
    (patch: Partial<Prefs>) => {
      if (DEMO_MODE) {
        setDemoPrefsState((current) => ({ ...current, ...patch }));
        return;
      }
      if (!householdId) return;
      updateMutation.mutate(patch);
    },
    [householdId, updateMutation],
  );

  const generateMutation = useMutation({
    mutationFn: () => apiGenerateWeek(householdId as number),
    onSuccess: (days) => queryClient.setQueryData(["week", householdId], days),
  });
  const generateWeek = useCallback(async () => {
    if (DEMO_MODE) {
      setDemoWeekState(demoWeek);
      return;
    }
    if (!householdId) return;
    await generateMutation.mutateAsync();
  }, [householdId, generateMutation]);

  const assignMutation = useMutation({
    mutationFn: ({ date, slot, recipeId }: { date: string; slot: MealSlot; recipeId: string }) =>
      assignMeal(householdId as number, date, slot, recipeId),
    onSuccess: invalidateWeek,
  });
  const assign = useCallback(
    async (date: string, slot: MealSlot, recipeId: string) => {
      if (DEMO_MODE) {
        const recipe = demoWeekState.flatMap((day) => day.meals).find((meal) => meal.recipeId === recipeId)?.recipe;
        if (!recipe) return;
        setDemoWeekState((days) =>
          days.map((day) =>
            day.date === date
              ? {
                  ...day,
                  meals: day.meals.map((meal) =>
                    meal.slot === slot ? { slot, recipeId: recipe.id, recipe } : meal,
                  ),
                }
              : day,
          ),
        );
        return;
      }
      if (!householdId) return;
      await assignMutation.mutateAsync({ date, slot, recipeId });
    },
    [householdId, assignMutation, demoWeekState],
  );

  const swapMutation = useMutation({
    mutationFn: ({ date, slot }: { date: string; slot: MealSlot }) => swapMeal(householdId as number, date, slot),
    onSuccess: invalidateWeek,
  });
  const swap = useCallback(
    async (date: string, slot: MealSlot) => {
      if (DEMO_MODE) {
        const recipe = demoSwapRecipe(slot);
        setDemoWeekState((days) =>
          days.map((day) =>
            day.date === date
              ? {
                  ...day,
                  meals: day.meals.map((meal) =>
                    meal.slot === slot ? { slot, recipeId: recipe.id, recipe } : meal,
                  ),
                }
              : day,
          ),
        );
        return recipe;
      }
      if (!householdId) return null;
      const result = await swapMutation.mutateAsync({ date, slot });
      const meal = result.meals.find((m) => m.slot === slot);
      return meal?.recipe ?? null;
    },
    [householdId, swapMutation],
  );

  const nextMeal = useMemo(() => {
    const hour = new Date().getHours();
    const upcoming = SLOT_ORDER.find(
      (s) => hour < ({ breakfast: 8, lunch: 13, snack: 17, dinner: 20 } as Record<MealSlot, number>)[s],
    );
    const day = week.find((d) => d.date === todayKey) ?? week[0];
    if (!day) return null;
    if (upcoming) {
      const meal = day.meals.find((m) => m.slot === upcoming);
      return meal ? { date: day.date, slot: upcoming, recipe: meal.recipe } : null;
    }
    const tomorrow = week[1] ?? week[0];
    const meal = tomorrow?.meals[0];
    return meal ? { date: tomorrow.date, slot: meal.slot, recipe: meal.recipe } : null;
  }, [week, todayKey]);

  const scaled = useCallback(
    (r: Recipe) => r.ingredients.map((ing) => ({ ...ing, qty: Math.round(ing.qty * prefs.household * 10) / 10 })),
    [prefs.household],
  );

  // recipe.nutrition is per-serving (see app/nutrition.py) - same
  // household-size scaling convention as scaled() above.
  const scaledNutrition = useCallback(
    (r: Recipe) => ({
      protein: Math.round(r.nutrition.protein * prefs.household * 10) / 10,
      carbs: Math.round(r.nutrition.carbs * prefs.household * 10) / 10,
      fat: Math.round(r.nutrition.fat * prefs.household * 10) / 10,
      calories: Math.round(r.nutrition.calories * prefs.household),
    }),
    [prefs.household],
  );

  const value: Ctx = {
    householdId,
    hasHousehold,
    loadingHousehold: DEMO_MODE ? false : householdQuery.isLoading,
    prefs,
    setPrefs,
    createHousehold,
    creatingHousehold: createMutation.isPending,

    week,
    loadingWeek: DEMO_MODE ? false : weekQuery.isLoading,
    today: todayKey,
    selected,
    setSelected,

    generateWeek,
    generatingWeek: generateMutation.isPending,

    swap,
    assign,

    nextMeal,
    scaled,
    scaledNutrition,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside PlannerProvider");
  return ctx;
}
