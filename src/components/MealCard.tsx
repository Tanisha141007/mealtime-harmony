import { Clock, RefreshCw } from "lucide-react";
import { DishArt } from "./DishArt";
import { DietDot } from "./DietDot";
import { SLOT_LABEL, SLOT_TIME, type MealSlot } from "@/lib/recipes";
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
    <article className="soft-card flex items-center gap-4 p-4">
      <div className="grid size-20 shrink-0 place-items-center bg-cream blob">
        <DishArt art={recipe.art} alt={recipe.name} className="size-16" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {SLOT_LABEL[slot]} · {SLOT_TIME[slot]}
        </div>
        <h3 className="mt-0.5 truncate text-lg leading-snug">{recipe.name}</h3>
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
  );
}
