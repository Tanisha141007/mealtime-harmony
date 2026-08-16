import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BellRing, ChevronDown, Copy, Minus, Phone, Plus, Sparkles, Trash2, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlanner } from "@/lib/planner";
import { askAi, type HouseholdInput } from "@/lib/api";
import { SLOT_LABEL, SLOT_ORDER, type MealSlot } from "@/lib/recipes";
import type { DayKey } from "@/lib/planner";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Household Preferences — ahaar" },
      {
        name: "description",
        content:
          "Set household size, diets, allergies, favourite cuisines and how your cook gets notified.",
      },
      { property: "og:title", content: "Household Preferences — ahaar" },
      {
        property: "og:description",
        content: "Tune diets, dislikes and cook notification settings for your meal plan.",
      },
    ],
  }),
  component: PreferencesPage,
});

const DIET_TYPES: { value: string; label: string }[] = [
  { value: "veg", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "jain", label: "Jain" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non-veg", label: "Non-vegetarian" },
];

const SPICE_LEVELS = ["mild", "medium", "hot"];

const STATES = [
  "Kerala",
  "Tamil Nadu",
  "Punjab",
  "Gujarat",
  "Maharashtra",
  "West Bengal",
  "Rajasthan",
  "Andhra Pradesh",
  "Goa",
  "Karnataka",
];

const SCHEDULE_DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const DEFAULT_SCHEDULE_ROWS = [
  { enabled: true, time: "12:00", meals: ["lunch" as MealSlot], message: "" },
  { enabled: true, time: "18:00", meals: ["dinner" as MealSlot], message: "" },
];

const mealSelectionLabel = (meals: MealSlot[]) => {
  if (!meals.length) return "Select meals";
  if (meals.length === 1) return SLOT_LABEL[meals[0]];
  return meals.map((meal) => SLOT_LABEL[meal]).join(", ");
};

function Chips({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const on = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors " +
              (on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary")
            }
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="soft-card p-5">
      <h2 className="mb-3 text-lg">{title}</h2>
      {children}
    </section>
  );
}

function TagList({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((a) => (
        <span
          key={a}
          className="inline-flex items-center gap-1.5 rounded-full bg-berry px-3 py-1.5 text-sm font-bold text-berry-foreground"
        >
          {a}
          <button aria-label={`Remove ${a}`} onClick={() => onRemove(a)}>
            <X className="size-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

function PreferencesPage() {
  const { hasHousehold, loadingHousehold } = usePlanner();

  if (loadingHousehold) {
    return (
      <AppShell>
        <p className="pt-10 text-center text-sm text-muted-foreground">Loading...</p>
      </AppShell>
    );
  }

  return hasHousehold ? <EditHousehold /> : <Onboarding />;
}

function Onboarding() {
  const { createHousehold, creatingHousehold } = usePlanner();
  const [form, setForm] = useState<HouseholdInput>({
    name: "",
    flat_no: "",
    building: "",
    cook_name: "",
    cook_phone: "",
    city: "",
    state: "",
    diet_type: "veg",
    family_size: 4,
    spice_level: "medium",
    allergies: [],
    disliked_ingredients: [],
    preferred_cuisines: [],
    notes: "",
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [newDislike, setNewDislike] = useState("");

  const set = <K extends keyof HouseholdInput>(key: K, value: HouseholdInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.name.trim() || !form.cook_name.trim() || !form.cook_phone.trim()) {
      toast.error("Household name, cook's name and phone are required");
      return;
    }
    try {
      await createHousehold(form);
      toast.success("Household created", { description: "Next: generate your first week of meals." });
    } catch (e) {
      toast.error("Couldn't create household", { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <AppShell>
      <PageHeader title="Welcome" subtitle="Let's set up your household" />
      <div className="space-y-4">
        <Section title="Household">
          <label className="text-sm font-bold" htmlFor="name">
            Household name
          </label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Malani household"
            className="mt-1.5 rounded-2xl bg-cream"
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold" htmlFor="flat-no">
                Flat no.
              </label>
              <Input
                id="flat-no"
                value={form.flat_no}
                onChange={(e) => set("flat_no", e.target.value)}
                placeholder="203"
                className="mt-1.5 rounded-2xl bg-cream"
              />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="building">
                Building
              </label>
              <Input
                id="building"
                value={form.building}
                onChange={(e) => set("building", e.target.value)}
                placeholder="Shiv Chintan"
                className="mt-1.5 rounded-2xl bg-cream"
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Shown to your cook as घर: flat no., building name in Hindi.</p>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
            <span className="text-sm font-bold">People to cook for</span>
            <div className="flex items-center gap-3">
              <button
                aria-label="Decrease household size"
                onClick={() => set("family_size", Math.max(1, (form.family_size ?? 4) - 1))}
                className="grid size-9 place-items-center rounded-xl bg-card text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="font-display w-6 text-center text-xl font-bold">{form.family_size}</span>
              <button
                aria-label="Increase household size"
                onClick={() => set("family_size", Math.min(20, (form.family_size ?? 4) + 1))}
                className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold" htmlFor="city">
                City
              </label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="mt-1.5 rounded-2xl bg-cream"
              />
            </div>
            <div>
              <label className="text-sm font-bold">State</label>
              <select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-cream px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Used to surface dishes popular in your region.</p>
        </Section>

        <Section title="Diet & restrictions">
          <label className="text-sm font-bold">Diet type</label>
          <select
            value={form.diet_type}
            onChange={(e) => set("diet_type", e.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-cream px-3 py-2 text-sm"
          >
            {DIET_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-bold">Spice level</label>
          <Chips
            items={SPICE_LEVELS}
            selected={[form.spice_level ?? "medium"]}
            onToggle={(v) => set("spice_level", v)}
          />

          <p className="mt-5 mb-2 text-sm font-bold">Allergies</p>
          <TagList
            items={form.allergies ?? []}
            onRemove={(v) => set("allergies", (form.allergies ?? []).filter((x) => x !== v))}
          />
          <div className="mt-3 flex gap-2">
            <Input
              value={newAllergy}
              placeholder="Add an allergy (e.g. peanut, dairy)"
              onChange={(e) => setNewAllergy(e.target.value)}
              className="rounded-2xl bg-cream"
            />
            <button
              onClick={() => {
                if (!newAllergy.trim()) return;
                set("allergies", [...(form.allergies ?? []), newAllergy.trim()]);
                setNewAllergy("");
              }}
              className="shrink-0 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            >
              Add
            </button>
          </div>

          <p className="mt-5 mb-2 text-sm font-bold">Disliked ingredients</p>
          <TagList
            items={form.disliked_ingredients ?? []}
            onRemove={(v) => set("disliked_ingredients", (form.disliked_ingredients ?? []).filter((x) => x !== v))}
          />
          <div className="mt-3 flex gap-2">
            <Input
              value={newDislike}
              placeholder="Add an ingredient"
              onChange={(e) => setNewDislike(e.target.value)}
              className="rounded-2xl bg-cream"
            />
            <button
              onClick={() => {
                if (!newDislike.trim()) return;
                set("disliked_ingredients", [...(form.disliked_ingredients ?? []), newDislike.trim()]);
                setNewDislike("");
              }}
              className="shrink-0 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            >
              Add
            </button>
          </div>
        </Section>

        <Section title="Favourite cuisines">
          <Chips
            items={STATES}
            selected={form.preferred_cuisines ?? []}
            onToggle={(v) =>
              set(
                "preferred_cuisines",
                (form.preferred_cuisines ?? []).includes(v)
                  ? (form.preferred_cuisines ?? []).filter((x) => x !== v)
                  : [...(form.preferred_cuisines ?? []), v],
              )
            }
          />
        </Section>

        <Section title="Cook's details">
          <label className="text-sm font-bold" htmlFor="cook">
            Cook's name
          </label>
          <Input
            id="cook"
            value={form.cook_name}
            onChange={(e) => set("cook_name", e.target.value)}
            className="mt-1.5 rounded-2xl bg-cream"
          />
          <label className="mt-3 block text-sm font-bold" htmlFor="phone">
            Phone number
          </label>
          <div className="relative mt-1.5">
            <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              value={form.cook_phone}
              onChange={(e) => set("cook_phone", e.target.value)}
              placeholder="+919812345678"
              className="rounded-2xl bg-cream pl-9"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            For reference - your cook will link their own Telegram/messaging identity with a code after
            you save.
          </p>
        </Section>

        <button
          onClick={submit}
          disabled={creatingHousehold}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {creatingHousehold ? "Creating..." : "Create household"}
        </button>
      </div>
    </AppShell>
  );
}

function EditHousehold() {
  const { prefs, setPrefs, householdId } = usePlanner();
  const [tab, setTab] = useState<"profile" | "scheduler">("profile");
  const [ask, setAsk] = useState("");
  const [asking, setAsking] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [newDislike, setNewDislike] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [copyScheduleToEveryDay, setCopyScheduleToEveryDay] = useState(false);

  // Local-buffered text fields - save on blur instead of every keystroke,
  // since every change here is a real API call now (not local state).
  const [cookName, setCookName] = useState(prefs.cookName);
  const [cookPhone, setCookPhone] = useState(prefs.cookPhone);
  const [flatNo, setFlatNo] = useState(prefs.flatNo);
  const [building, setBuilding] = useState(prefs.building);
  const [city, setCity] = useState(prefs.city);

  const toggleCuisine = (value: string) => {
    const list = prefs.cuisines;
    setPrefs({ cuisines: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const applySchedule = (schedule: typeof prefs.cookMessageSchedule) => {
    setPrefs({ cookMessageSchedule: schedule });
  };

  const copyDayToAllDays = (source: DayKey, schedule = prefs.cookMessageSchedule) => {
    const sourceRows = (schedule[source] || []).map((row) => ({ ...row, meals: [...row.meals] }));
    const next = SCHEDULE_DAYS.reduce(
      (acc, day) => ({ ...acc, [day.key]: sourceRows.map((row) => ({ ...row, meals: [...row.meals] })) }),
      {} as typeof prefs.cookMessageSchedule,
    );
    applySchedule(next);
  };

  const setDaySchedule = (day: DayKey, rows: typeof prefs.cookMessageSchedule[DayKey]) => {
    const next = { ...prefs.cookMessageSchedule, [day]: rows };
    if (copyScheduleToEveryDay && day === "monday") {
      copyDayToAllDays("monday", next);
      return;
    }
    applySchedule(next);
  };

  const getDayRows = (day: DayKey) => {
    const rows = prefs.cookMessageSchedule[day] || [];
    return rows.length ? rows : DEFAULT_SCHEDULE_ROWS.map((row) => ({ ...row, meals: [...row.meals] }));
  };

  const addScheduleRow = (day: DayKey) => {
    setDaySchedule(day, [
      ...getDayRows(day),
      { enabled: true, time: "09:00", meals: ["lunch"], message: "" },
    ]);
  };

  const updateScheduleRow = (
    day: DayKey,
    index: number,
    patch: Partial<typeof prefs.cookMessageSchedule[DayKey][number]>,
  ) => {
    const rows = getDayRows(day);
    setDaySchedule(
      day,
      rows.map((row, idx) => (idx === index ? { ...row, ...patch } : row)),
    );
  };

  const removeScheduleRow = (day: DayKey, index: number) => {
    setDaySchedule(day, getDayRows(day).filter((_, idx) => idx !== index));
  };

  const toggleScheduleMeal = (day: DayKey, index: number, slot: MealSlot) => {
    const row = getDayRows(day)[index];
    const meals = row.meals.includes(slot)
      ? row.meals.filter((meal) => meal !== slot)
      : [...row.meals, slot];
    updateScheduleRow(day, index, { meals: meals.length ? meals : [slot] });
  };

  const submitAsk = async () => {
    if (!ask.trim() || !householdId) return;
    setAsking(true);
    try {
      const result = await askAi(householdId, ask.trim());
      setReplies((r) => [result.reply, ...r]);
      setAsk("");
      toast.success("Got it", { description: "Folded into your household's notes." });
    } catch (e) {
      toast.error("Couldn't process that", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setAsking(false);
    }
  };

  const copyLinkCode = () => {
    navigator.clipboard.writeText(prefs.linkCode);
    toast.success("Copied", { description: "Send this to your cook." });
  };

  return (
    <AppShell>
      <PageHeader title="Preferences" subtitle="How your household eats" />

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-cream p-1">
        {[
          ["profile", "Profile"],
          ["scheduler", "Scheduler"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value as "profile" | "scheduler")}
            className={
              "rounded-xl px-3 py-2 text-sm font-bold transition-colors " +
              (tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === "profile" ? (
          <>
        <Section title="Cook status">
          {prefs.cookLinked ? (
            <p className="text-sm font-semibold text-primary">
              {prefs.cookName} is linked and receiving meal updates.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                They can open Telegram and send this code to{" "}
                <a
                  href="https://t.me/ahaara_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-primary underline underline-offset-2"
                >
                  @ahaara_bot
                </a>
              </p>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
                <span className="font-display text-2xl font-bold tracking-widest">{prefs.linkCode}</span>
                <button
                  onClick={copyLinkCode}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  <Copy className="size-3.5" /> Copy
                </button>
              </div>
            </>
          )}
        </Section>

        <Section title="Household">
          <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
            <span className="text-sm font-bold">People to cook for</span>
            <div className="flex items-center gap-3">
              <button
                aria-label="Decrease household size"
                onClick={() => setPrefs({ household: Math.max(1, prefs.household - 1) })}
                className="grid size-9 place-items-center rounded-xl bg-card text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="font-display w-6 text-center text-xl font-bold">{prefs.household}</span>
              <button
                aria-label="Increase household size"
                onClick={() => setPrefs({ household: Math.min(20, prefs.household + 1) })}
                className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold" htmlFor="flat-no-edit">
                Flat no.
              </label>
              <Input
                id="flat-no-edit"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                onBlur={() => flatNo !== prefs.flatNo && setPrefs({ flatNo })}
                placeholder="203"
                className="mt-1.5 rounded-2xl bg-cream"
              />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="building-edit">
                Building
              </label>
              <Input
                id="building-edit"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                onBlur={() => building !== prefs.building && setPrefs({ building })}
                placeholder="Shiv Chintan"
                className="mt-1.5 rounded-2xl bg-cream"
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Cook messages use this as घर: flat no., building name in Hindi.</p>
          <label className="mt-3 block text-sm font-bold" htmlFor="city">
            City
          </label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => city !== prefs.city && setPrefs({ city })}
            className="mt-1.5 rounded-2xl bg-cream"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            State: {prefs.state || "not set"} · used to surface dishes popular in your region.
          </p>
        </Section>

        <Section title="Diet & restrictions">
          <label className="text-sm font-bold">Diet type</label>
          <select
            value={prefs.dietType}
            onChange={(e) => setPrefs({ dietType: e.target.value })}
            className="mt-1.5 w-full rounded-2xl bg-cream px-3 py-2 text-sm"
          >
            {DIET_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <p className="mt-5 mb-2 text-sm font-bold">Allergies</p>
          <TagList items={prefs.allergies} onRemove={(v) => setPrefs({ allergies: prefs.allergies.filter((x) => x !== v) })} />
          <div className="mt-3 flex gap-2">
            <Input
              value={newAllergy}
              placeholder="Add an allergy"
              onChange={(e) => setNewAllergy(e.target.value)}
              className="rounded-2xl bg-cream"
            />
            <button
              onClick={() => {
                if (!newAllergy.trim()) return;
                setPrefs({ allergies: [...prefs.allergies, newAllergy.trim()] });
                setNewAllergy("");
              }}
              className="shrink-0 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            >
              Add
            </button>
          </div>

          <p className="mt-5 mb-2 text-sm font-bold">Disliked ingredients</p>
          <TagList items={prefs.dislikes} onRemove={(v) => setPrefs({ dislikes: prefs.dislikes.filter((x) => x !== v) })} />
          <div className="mt-3 flex gap-2">
            <Input
              value={newDislike}
              placeholder="Add an ingredient"
              onChange={(e) => setNewDislike(e.target.value)}
              className="rounded-2xl bg-cream"
            />
            <button
              onClick={() => {
                if (!newDislike.trim()) return;
                setPrefs({ dislikes: [...prefs.dislikes, newDislike.trim()] });
                setNewDislike("");
              }}
              className="shrink-0 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            >
              Add
            </button>
          </div>
        </Section>

        <Section title="Favourite cuisines">
          <Chips items={STATES} selected={prefs.cuisines} onToggle={toggleCuisine} />
        </Section>

        <Section title="Cook settings">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold" htmlFor="cook">
                Cook's name
              </label>
              <Input
                id="cook"
                value={cookName}
                onChange={(e) => setCookName(e.target.value)}
                onBlur={() => cookName !== prefs.cookName && setPrefs({ cookName })}
                className="mt-1.5 rounded-2xl bg-cream"
              />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="phone">
                Phone number
              </label>
              <div className="relative mt-1.5">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={cookPhone}
                  onChange={(e) => setCookPhone(e.target.value)}
                  onBlur={() => cookPhone !== prefs.cookPhone && setPrefs({ cookPhone })}
                  className="rounded-2xl bg-cream pl-9"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
              <p className="text-sm font-bold">Notify ahead of the meal</p>
              <div className="flex gap-1.5">
                {[3, 12, 24].map((h) => (
                  <button
                    key={h}
                    onClick={() => setPrefs({ leadHours: h })}
                    className={
                      "rounded-xl px-3 py-1.5 text-sm font-bold " +
                      (prefs.leadHours === h ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")
                    }
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Ask ahaar">
          <p className="mb-3 text-sm text-muted-foreground">
            Describe what you want in plain language and it folds into your profile.
          </p>
          <Textarea
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="e.g. more high-protein breakfasts, no repeated dals more than once a week"
            className="min-h-24 rounded-2xl bg-cream"
          />
          <button
            onClick={submitAsk}
            disabled={asking}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            <Sparkles className="size-4" /> {asking ? "Thinking..." : "Update my plan"}
          </button>
          <div className="mt-4 space-y-2">
            {replies.map((r, idx) => (
              <p key={idx} className="rounded-2xl rounded-tl-sm bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
                {r}
              </p>
            ))}
          </div>
          {prefs.notes && (
            <div className="mt-4 rounded-2xl bg-cream p-3">
              <p className="text-xs font-bold text-muted-foreground">Current notes:</p>
              <p className="mt-1 text-xs whitespace-pre-wrap text-muted-foreground">{prefs.notes}</p>
            </div>
          )}
        </Section>
          </>
        ) : (
          <>
            <Section title="Daily cook schedule">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-cream px-4 py-3">
                <div>
                  <p className="text-sm font-bold">Schedule daily meal messages</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Send different messages at different times through the week.
                  </p>
                </div>
                <button
                  onClick={() => setPrefs({ notifyMe: !prefs.notifyMe })}
                  className={
                    "rounded-full px-4 py-2 text-sm font-bold " +
                    (prefs.notifyMe ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")
                  }
                >
                  {prefs.notifyMe ? "On" : "Off"}
                </button>
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <input
                  type="checkbox"
                  checked={copyScheduleToEveryDay}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setCopyScheduleToEveryDay(checked);
                    if (checked) copyDayToAllDays("monday");
                  }}
                  className="mt-1 size-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-bold">Copy Monday's schedule to each day</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Keep this on when the same cook rhythm repeats all week.
                  </span>
                </span>
              </label>

              <div className="mt-5 grid gap-3">
                {SCHEDULE_DAYS.map((day) => {
                  const rows = getDayRows(day.key);
                  return (
                    <div key={day.key} className="rounded-2xl bg-cream p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-bold">{day.label}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {rows.map((row, index) => (
                          <div
                            key={`${day.key}-${index}`}
                            className="flex flex-wrap items-center gap-2 rounded-2xl bg-card px-3 py-2"
                          >
                            <span className="text-sm font-semibold text-muted-foreground">send message for</span>
                            <details
                              className={
                                "group relative " +
                                (copyScheduleToEveryDay && day.key !== "monday" ? "pointer-events-none opacity-40" : "")
                              }
                            >
                              <summary className="inline-flex min-h-10 max-w-full cursor-pointer list-none items-center gap-2 rounded-xl bg-cream px-3 text-left text-sm font-bold text-foreground">
                                <span className="max-w-52 truncate">{mealSelectionLabel(row.meals as MealSlot[])}</span>
                                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="absolute left-0 z-20 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lg">
                                {SLOT_ORDER.map((slot) => (
                                  <label
                                    key={slot}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-cream"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={row.meals.includes(slot)}
                                      onChange={() => toggleScheduleMeal(day.key, index, slot)}
                                      className="size-4 accent-primary"
                                    />
                                    {SLOT_LABEL[slot]}
                                  </label>
                                ))}
                              </div>
                            </details>
                            <span className="text-sm font-semibold text-muted-foreground">at</span>
                            <Input
                              type="time"
                              value={row.time}
                              onChange={(e) => updateScheduleRow(day.key, index, { time: e.target.value })}
                              disabled={copyScheduleToEveryDay && day.key !== "monday"}
                              className="h-10 w-32 rounded-xl bg-cream"
                            />
                            <div className="ml-auto flex items-center gap-1">
                              <button
                                onClick={() => addScheduleRow(day.key)}
                                disabled={copyScheduleToEveryDay && day.key !== "monday"}
                                className="grid size-9 place-items-center rounded-xl bg-cream text-foreground disabled:opacity-40"
                                aria-label={`Add ${day.label} message`}
                              >
                                <Plus className="size-4" />
                              </button>
                              <button
                                onClick={() => removeScheduleRow(day.key, index)}
                                disabled={copyScheduleToEveryDay && day.key !== "monday"}
                                className="grid size-9 place-items-center rounded-xl bg-cream text-muted-foreground disabled:opacity-40"
                                aria-label={`Delete ${day.label} message`}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl bg-secondary p-3 text-sm font-semibold text-secondary-foreground">
                <BellRing className="mr-1.5 inline size-4" />
                {prefs.notifyMe
                  ? `${prefs.cookName || "Your cook"} will receive the enabled messages at the times above.`
                  : "Scheduled cook messages are off."}
              </div>
            </Section>

            <Section title="Cook link">
              {prefs.cookLinked ? (
                <p className="text-sm font-semibold text-primary">
                  {prefs.cookName} is linked and can receive scheduled meal messages.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Ask {prefs.cookName || "your cook"} to open{" "}
                    <a
                      href="https://t.me/ahaara_bot"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary underline underline-offset-2"
                    >
                      @ahaara_bot
                    </a>{" "}
                    and send this code. If they cook for multiple homes, each household can send its own code in the
                    same bot chat:
                  </p>
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
                    <span className="font-display text-2xl font-bold tracking-widest">{prefs.linkCode}</span>
                    <button
                      onClick={copyLinkCode}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                    >
                      <Copy className="size-3.5" /> Copy
                    </button>
                  </div>
                </>
              )}
            </Section>
          </>
        )}
      </div>
    </AppShell>
  );
}
