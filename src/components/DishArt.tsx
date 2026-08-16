import curry from "@/assets/dish-curry.png";
import dosa from "@/assets/dish-dosa.png";
import thali from "@/assets/dish-thali.png";
import chai from "@/assets/dish-chai.png";
import type { ApiArt as Art } from "@/lib/api";
import { cn } from "@/lib/utils";

const SRC: Record<Art, string> = { curry, dosa, thali, chai };

export function DishArt({
  art,
  alt,
  className,
  priority = false,
}: {
  art: Art;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={SRC[art]}
      alt={alt}
      width={768}
      height={768}
      loading={priority ? "eager" : "lazy"}
      className={cn("object-contain drop-shadow-sm", className)}
    />
  );
}
