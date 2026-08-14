import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Phone, Plus, Sparkles, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePlanner } from "@/lib/planner";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Household Preferences — Caspian" },
      {
        name: "description",
        content:
          "Set household size, diets, allergies, favourite cuisines and how your cook gets notified.",
      },
      { property: "og:title", content: "Household Preferences — Caspian" },
      {
        property: "og:description",
        content: "Tune diets, dislikes and cook notification settings for your meal plan.",
      },
    ],
  }),
  component: Preferences,
});

const DIET_OPTIONS = [
  "Vegetarian-leaning",
  "Pure veg",
  "High protein",
  "Low carb",
  "Millet-forward",
  "Eggs okay",
  "Seafood okay",
];

const CUISINES = [
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

const AI_REPLIES = [
  "Noted — I'll bias breakfasts toward higher-protein options like sundal, dhokla and akuri.",
  "Got it. I'll keep dals to twice a week and rotate in more vegetable-forward mains.",
  "Understood — millet dishes like ragi dosa and jowar bhakri will show up more often.",
];

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

function Preferences() {
  const { prefs, setPrefs } = usePlanner();
  const [ask, setAsk] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [newDislike, setNewDislike] = useState("");

  const toggle = (key: "diets" | "cuisines") => (value: string) => {
    const list = prefs[key];
    setPrefs({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const submitAsk = () => {
    if (!ask.trim()) return;
    setReplies((r) => [AI_REPLIES[r.length % AI_REPLIES.length]!, ...r]);
    setAsk("");
    toast.success("Added to your profile", { description: "Simulated in this prototype." });
  };

  return (
    <AppShell>
      <PageHeader title="Preferences" subtitle="How your household eats" />

      <div className="space-y-4">
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
              <span className="font-display w-6 text-center text-xl font-bold">
                {prefs.household}
              </span>
              <button
                aria-label="Increase household size"
                onClick={() => setPrefs({ household: Math.min(12, prefs.household + 1) })}
                className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <label className="mt-3 block text-sm font-bold" htmlFor="location">
            Location
          </label>
          <Input
            id="location"
            value={prefs.location}
            onChange={(e) => setPrefs({ location: e.target.value })}
            className="mt-1.5 rounded-2xl bg-cream"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Used to surface dishes popular in your region.
          </p>
        </Section>

        <Section title="Diet & restrictions">
          <Chips items={DIET_OPTIONS} selected={prefs.diets} onToggle={toggle("diets")} />
          <p className="mt-5 mb-2 text-sm font-bold">Allergies</p>
          <div className="flex flex-wrap gap-2">
            {prefs.allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full bg-berry px-3 py-1.5 text-sm font-bold text-berry-foreground"
              >
                {a}
                <button
                  aria-label={`Remove ${a}`}
                  onClick={() => setPrefs({ allergies: prefs.allergies.filter((x) => x !== a) })}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <p className="mt-5 mb-2 text-sm font-bold">Disliked ingredients</p>
          <div className="flex flex-wrap gap-2">
            {prefs.dislikes.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground"
              >
                {d}
                <button
                  aria-label={`Remove ${d}`}
                  onClick={() => setPrefs({ dislikes: prefs.dislikes.filter((x) => x !== d) })}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
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
          <Chips items={CUISINES} selected={prefs.cuisines} onToggle={toggle("cuisines")} />
        </Section>

        <Section title="Cook settings">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold" htmlFor="cook">
                Cook's name
              </label>
              <Input
                id="cook"
                value={prefs.cookName}
                onChange={(e) => setPrefs({ cookName: e.target.value })}
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
                  value={prefs.cookPhone}
                  onChange={(e) => setPrefs({ cookPhone: e.target.value })}
                  className="rounded-2xl bg-cream pl-9"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
              <div>
                <p className="text-sm font-bold">Send on WhatsApp</p>
                <p className="text-xs text-muted-foreground">Off sends plain SMS instead.</p>
              </div>
              <Switch
                checked={prefs.channel === "whatsapp"}
                onCheckedChange={(v) => setPrefs({ channel: v ? "whatsapp" : "sms" })}
              />
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
                      (prefs.leadHours === h
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground")
                    }
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Messaging is simulated in this prototype — nothing is actually sent.
            </p>
          </div>
        </Section>

        <Section title="Ask Caspian">
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
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Sparkles className="size-4" /> Update my plan
          </button>
          <div className="mt-4 space-y-2">
            {replies.map((r, idx) => (
              <p
                key={idx}
                className="rounded-2xl rounded-tl-sm bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
              >
                {r}
              </p>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
