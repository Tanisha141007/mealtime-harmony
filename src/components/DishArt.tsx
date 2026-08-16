import curry from "@/assets/dish-curry.png";
import dosa from "@/assets/dish-dosa.png";
import thali from "@/assets/dish-thali.png";
import chai from "@/assets/dish-chai.png";
import biryani from "@/assets/dish-biryani.png";
import dal from "@/assets/dish-dal.png";
import roti from "@/assets/dish-roti.png";
import idli from "@/assets/dish-idli.png";
import samosa from "@/assets/dish-samosa.png";
import paneer from "@/assets/dish-paneer.png";
import fish from "@/assets/dish-fish.png";
import chicken from "@/assets/dish-chicken.png";
import egg from "@/assets/dish-egg.png";
import rice from "@/assets/dish-rice.png";
import soup from "@/assets/dish-soup.png";
import salad from "@/assets/dish-salad.png";
import poha from "@/assets/dish-poha.png";
import paratha from "@/assets/dish-paratha.png";
import khichdi from "@/assets/dish-khichdi.png";
import sweet from "@/assets/dish-sweet.png";
import lassi from "@/assets/dish-lassi.png";
import noodles from "@/assets/dish-noodles.png";
import sandwich from "@/assets/dish-sandwich.png";
import vada from "@/assets/dish-vada.png";
import pulao from "@/assets/dish-pulao.png";
import raita from "@/assets/dish-raita.png";
import kebab from "@/assets/dish-kebab.png";
import sabzi from "@/assets/dish-sabzi.png";
import upma from "@/assets/dish-upma.png";
import chole from "@/assets/dish-chole.png";
import dhokla from "@/assets/dish-dhokla.png";
import fruit from "@/assets/dish-fruit.png";
import type { ApiArt } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Every illustrated food category we ship art for. */
export type DishArtKey =
  | ApiArt
  | "biryani"
  | "dal"
  | "roti"
  | "idli"
  | "samosa"
  | "paneer"
  | "fish"
  | "chicken"
  | "egg"
  | "rice"
  | "soup"
  | "salad"
  | "poha"
  | "paratha"
  | "khichdi"
  | "sweet"
  | "lassi"
  | "noodles"
  | "sandwich"
  | "vada"
  | "pulao"
  | "raita"
  | "kebab"
  | "sabzi"
  | "upma"
  | "chole"
  | "dhokla"
  | "fruit";

const SRC: Record<DishArtKey, string> = {
  curry,
  dosa,
  thali,
  chai,
  biryani,
  dal,
  roti,
  idli,
  samosa,
  paneer,
  fish,
  chicken,
  egg,
  rice,
  soup,
  salad,
  poha,
  paratha,
  khichdi,
  sweet,
  lassi,
  noodles,
  sandwich,
  vada,
  pulao,
  raita,
  kebab,
  sabzi,
  upma,
  chole,
  dhokla,
  fruit,
};

// Dish-name keywords -> art category. First match wins, so keep the more
// specific keywords above the generic ones.
const KEYWORDS: [RegExp, DishArtKey][] = [
  [/biryani|pulihora|tehri/i, "biryani"],
  [/pulao|pulav|fried rice|jeera rice/i, "pulao"],
  [/khichdi|pongal|porridge/i, "khichdi"],
  [/upma|uppma|semiya|sheera/i, "upma"],
  [/poha|chivda|flattened rice/i, "poha"],
  [/idli|appam|puttu|steamed cake/i, "idli"],
  [/dosa|uttapam|pesarattu|adai/i, "dosa"],
  [/vada|bonda|bajji|pakora|pakoda/i, "vada"],
  [/samosa|kachori|puff/i, "samosa"],
  [/dhokla|khaman|handvo/i, "dhokla"],
  [/paratha|thepla|puri|bhatura|naan|kulcha/i, "paratha"],
  [/roti|chapati|phulka|bhakri|rotla/i, "roti"],
  [/chole|chana|rajma|lobia|chickpea/i, "chole"],
  [/dal|daal|sambar|rasam|kadhi|lentil/i, "dal"],
  [/paneer|malai kofta|shahi/i, "paneer"],
  [/fish|meen|prawn|crab|seafood|pomfret/i, "fish"],
  [/chicken|mutton|lamb|keema|curry cut/i, "chicken"],
  [/kebab|tikka|seekh|grill|tandoori/i, "kebab"],
  [/egg|anda|omelette|bhurji/i, "egg"],
  [/raita|curd|yogurt|dahi/i, "raita"],
  [/lassi|buttermilk|chaas|smoothie|juice|shake/i, "lassi"],
  [/chai|tea|coffee|kaapi/i, "chai"],
  [/halwa|laddoo|ladoo|barfi|kheer|payasam|sweet|dessert|jamun/i, "sweet"],
  [/noodle|hakka|maggi|pasta|thukpa|chowmein/i, "noodles"],
  [/sandwich|toast|bread roll|burger|wrap|roll/i, "sandwich"],
  [/salad|kosambari|sprout/i, "salad"],
  [/soup|shorba|broth/i, "soup"],
  [/fruit|mango|banana|papaya|melon/i, "fruit"],
  [/thali|meal|combo|platter/i, "thali"],
  [/rice|anna|steamed/i, "rice"],
  [/sabzi|subzi|bhaji|poriyal|thoran|masala|aloo|bhindi|gobi|baingan|vegetable/i, "sabzi"],
  [/curry|gravy|kuzhambu|kootu|stew/i, "curry"],
];

/** Pick the closest illustrated category for a dish name, with an API fallback. */
export function resolveDishArt(name: string | undefined, fallback: DishArtKey = "curry"): DishArtKey {
  if (name) {
    for (const [pattern, key] of KEYWORDS) {
      if (pattern.test(name)) return key;
    }
  }
  return fallback;
}

export function DishArt({
  art,
  alt,
  className,
  priority = false,
}: {
  art: DishArtKey;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const key = resolveDishArt(alt, SRC[art] ? art : "curry");
  return (
    <img
      src={SRC[key]}
      alt={alt}
      width={768}
      height={768}
      loading={priority ? "eager" : "lazy"}
      className={cn("object-contain drop-shadow-sm", className)}
    />
  );
}
