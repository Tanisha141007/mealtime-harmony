import { DIET_LABEL, type Diet } from "@/lib/recipes";
import { cn } from "@/lib/utils";

export function DietDot({ diet, withLabel = false }: { diet: Diet; withLabel?: boolean }) {
  const nonVeg = diet === "nonveg";
  const egg = diet === "egg";
  const color = nonVeg ? "border-nonveg" : egg ? "border-chart-4" : "border-veg";
  const fill = nonVeg ? "bg-nonveg" : egg ? "bg-chart-4" : "bg-veg";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn("flex size-3.5 items-center justify-center rounded-[4px] border-2", color)}
      >
        <span className={cn("size-1.5 rounded-full", fill)} />
      </span>
      <span className={cn("text-xs font-semibold", !withLabel && "sr-only")}>
        {DIET_LABEL[diet]}
      </span>
    </span>
  );
}
