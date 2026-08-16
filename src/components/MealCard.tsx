import { Clock, RefreshCw } from "lucide-react";
import { DishArt } from "./DishArt";
import { DietDot } from "./DietDot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DIET_LABEL, SLOT_LABEL, SLOT_TIME, type MealSlot } from "@/lib/recipes";
import type { Recipe } from "@/lib/planner";

export function MealCard({
  slot,
  recipe,
  onSwap,
  swapping,
}: {
  slot: MealSlot;
  recipe: Recipe;
  onSwap?: () => void;
  swapping?: boolean;
}) {
  return (
    <Dialog>
      <article className="soft-card flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left outline-none transition-colors hover:bg-cream/60 focus-visible:ring-2 focus-visible:ring-ring sm:gap-4"
          >
            <div className="grid size-20 shrink-0 place-items-center bg-cream blob">
              <DishArt art={recipe.art} alt={recipe.name} className="size-16" />
            </div>

            <div className="min-w-0 flex-1 py-1 pr-1">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {SLOT_LABEL[slot]} · {SLOT_TIME[slot]}
              </div>
              <h3 className="mt-0.5 text-lg leading-snug break-words">{recipe.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
                <DietDot diet={recipe.diet} withLabel />
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {recipe.minutes} min
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                  {recipe.region}
                </span>
              </div>
            </div>
          </button>
        </DialogTrigger>

        {onSwap && (
          <button
            onClick={onSwap}
            aria-label={`Swap ${SLOT_LABEL[slot]}`}
            className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className={swapping ? "size-4 animate-spin" : "size-4"} />
          </button>
        )}
      </article>

      <DialogContent className="max-w-sm overflow-hidden rounded-3xl border-none bg-card p-0 shadow-2xl">
        <div className="bg-primary p-5 text-primary-foreground">
          <div className="flex items-start gap-4 pr-8">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-widest uppercase opacity-85">
                {SLOT_LABEL[slot]} · {SLOT_TIME[slot]}
              </p>
              <DialogTitle className="mt-2 text-2xl leading-tight break-words">
                {recipe.name}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-semibold text-primary-foreground/85">
                {recipe.region} · {recipe.minutes} min
              </DialogDescription>
            </div>
            <DishArt art={recipe.art} alt={recipe.name} className="size-20 shrink-0" />
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between rounded-2xl bg-cream px-3.5 py-3">
            <span className="text-sm font-bold text-muted-foreground">Type</span>
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <DietDot diet={recipe.diet} />
              {DIET_LABEL[recipe.diet]}
            </span>
          </div>

          <div>
            <p className="text-sm font-bold text-muted-foreground">Nutrition per person</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NutritionStat label="Protein" value={`${recipe.nutrition.protein}g`} />
              <NutritionStat label="Carbs" value={`${recipe.nutrition.carbs}g`} />
              <NutritionStat label="Fat" value={`${recipe.nutrition.fat}g`} />
              <NutritionStat label="Calories" value={`${recipe.nutrition.calories} kcal`} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NutritionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold leading-none text-secondary-foreground">
        {value}
      </p>
    </div>
  );
}
