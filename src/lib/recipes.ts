export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
export type Diet = "veg" | "vegan" | "egg" | "nonveg";
export type Category = "protein" | "carb" | "vegetable" | "mixed";
export type Season = "summer" | "monsoon" | "winter" | "all";
export type Art = "curry" | "dosa" | "thali" | "chai";

export type Ingredient = { name: string; qty: number; unit: string };

export type Recipe = {
  id: string;
  name: string;
  region: string;
  slots: MealSlot[];
  diet: Diet;
  category: Category;
  season: Season;
  minutes: number;
  art: Art;
  /** quantities are per single serving */
  ingredients: Ingredient[];
};

const i = (name: string, qty: number, unit: string): Ingredient => ({ name, qty, unit });

export const RECIPES: Recipe[] = [
  // ---- Breakfast
  { id: "r1", name: "Masala Dosa", region: "Tamil Nadu", slots: ["breakfast"], diet: "vegan", category: "carb", season: "all", minutes: 25, art: "dosa",
    ingredients: [i("Dosa batter", 150, "ml"), i("Potato", 100, "g"), i("Onion", 40, "g"), i("Mustard seeds", 2, "g"), i("Curry leaves", 3, "leaves")] },
  { id: "r2", name: "Idli with Sambar", region: "Karnataka", slots: ["breakfast"], diet: "vegan", category: "carb", season: "all", minutes: 20, art: "dosa",
    ingredients: [i("Idli batter", 160, "ml"), i("Toor dal", 40, "g"), i("Drumstick", 30, "g"), i("Sambar powder", 8, "g")] },
  { id: "r3", name: "Poha with Peanuts", region: "Maharashtra", slots: ["breakfast"], diet: "vegan", category: "carb", season: "all", minutes: 15, art: "thali",
    ingredients: [i("Flattened rice", 70, "g"), i("Peanuts", 20, "g"), i("Onion", 40, "g"), i("Turmeric", 1, "g")] },
  { id: "r4", name: "Methi Thepla", region: "Gujarat", slots: ["breakfast", "snack"], diet: "veg", category: "carb", season: "winter", minutes: 30, art: "thali",
    ingredients: [i("Whole wheat flour", 60, "g"), i("Fenugreek leaves", 30, "g"), i("Curd", 20, "g"), i("Ajwain", 1, "g")] },
  { id: "r5", name: "Akuri on Toast", region: "Maharashtra", slots: ["breakfast"], diet: "egg", category: "protein", season: "all", minutes: 15, art: "thali",
    ingredients: [i("Eggs", 2, "pcs"), i("Onion", 30, "g"), i("Tomato", 30, "g"), i("Pav bread", 2, "slices")] },
  { id: "r6", name: "Appam with Stew", region: "Kerala", slots: ["breakfast"], diet: "veg", category: "mixed", season: "monsoon", minutes: 35, art: "dosa",
    ingredients: [i("Appam batter", 140, "ml"), i("Coconut milk", 100, "ml"), i("Mixed vegetables", 90, "g"), i("Black pepper", 2, "g")] },
  { id: "r7", name: "Upma with Vegetables", region: "Andhra Pradesh", slots: ["breakfast"], diet: "vegan", category: "carb", season: "all", minutes: 20, art: "thali",
    ingredients: [i("Semolina", 60, "g"), i("Carrot", 30, "g"), i("Green peas", 20, "g"), i("Ginger", 3, "g")] },
  { id: "r8", name: "Litti Chokha", region: "Bihar", slots: ["breakfast", "lunch"], diet: "veg", category: "mixed", season: "winter", minutes: 50, art: "thali",
    ingredients: [i("Wheat flour", 70, "g"), i("Sattu", 40, "g"), i("Brinjal", 80, "g"), i("Mustard oil", 8, "ml")] },
  { id: "r9", name: "Ragi Dosa", region: "Karnataka", slots: ["breakfast"], diet: "vegan", category: "carb", season: "summer", minutes: 20, art: "dosa",
    ingredients: [i("Ragi flour", 60, "g"), i("Rice flour", 20, "g"), i("Green chilli", 2, "g"), i("Coriander", 5, "g")] },
  { id: "r10", name: "Puri Bhaji", region: "Uttar Pradesh", slots: ["breakfast"], diet: "veg", category: "carb", season: "winter", minutes: 35, art: "thali",
    ingredients: [i("Wheat flour", 70, "g"), i("Potato", 120, "g"), i("Cumin", 2, "g"), i("Oil", 20, "ml")] },

  // ---- Lunch
  { id: "r11", name: "Rajma Chawal", region: "Punjab", slots: ["lunch"], diet: "veg", category: "protein", season: "winter", minutes: 60, art: "curry",
    ingredients: [i("Kidney beans", 70, "g"), i("Rice", 90, "g"), i("Onion", 60, "g"), i("Tomato", 70, "g"), i("Garam masala", 3, "g")] },
  { id: "r12", name: "Undhiyu with Rotli", region: "Gujarat", slots: ["lunch"], diet: "veg", category: "vegetable", season: "winter", minutes: 70, art: "thali",
    ingredients: [i("Mixed winter vegetables", 180, "g"), i("Green garlic", 15, "g"), i("Wheat flour", 60, "g"), i("Coconut", 20, "g")] },
  { id: "r13", name: "Puliyodarai", region: "Tamil Nadu", slots: ["lunch"], diet: "vegan", category: "carb", season: "summer", minutes: 35, art: "curry",
    ingredients: [i("Rice", 90, "g"), i("Tamarind", 20, "g"), i("Sesame oil", 12, "ml"), i("Peanuts", 15, "g")] },
  { id: "r14", name: "Kerala Fish Curry & Rice", region: "Kerala", slots: ["lunch"], diet: "nonveg", category: "protein", season: "monsoon", minutes: 45, art: "curry",
    ingredients: [i("Seer fish", 150, "g"), i("Kokum", 8, "g"), i("Coconut milk", 80, "ml"), i("Rice", 90, "g")] },
  { id: "r15", name: "Dal Baati", region: "Rajasthan", slots: ["lunch"], diet: "veg", category: "mixed", season: "winter", minutes: 75, art: "thali",
    ingredients: [i("Wheat flour", 80, "g"), i("Panchmel dal", 60, "g"), i("Ghee", 15, "g"), i("Ajwain", 2, "g")] },
  { id: "r16", name: "Shorshe Ilish", region: "West Bengal", slots: ["lunch"], diet: "nonveg", category: "protein", season: "monsoon", minutes: 40, art: "curry",
    ingredients: [i("Hilsa fish", 150, "g"), i("Mustard paste", 20, "g"), i("Mustard oil", 12, "ml"), i("Rice", 90, "g")] },
  { id: "r17", name: "Goan Prawn Xacuti", region: "Goa", slots: ["lunch", "dinner"], diet: "nonveg", category: "protein", season: "all", minutes: 50, art: "curry",
    ingredients: [i("Prawns", 140, "g"), i("Coconut", 40, "g"), i("Dried red chilli", 4, "g"), i("Rice", 80, "g")] },
  { id: "r18", name: "Pitla Bhakri", region: "Maharashtra", slots: ["lunch"], diet: "vegan", category: "protein", season: "monsoon", minutes: 30, art: "thali",
    ingredients: [i("Gram flour", 60, "g"), i("Jowar flour", 70, "g"), i("Onion", 40, "g"), i("Garlic", 5, "g")] },
  { id: "r19", name: "Andhra Gongura Pappu", region: "Andhra Pradesh", slots: ["lunch"], diet: "vegan", category: "protein", season: "summer", minutes: 40, art: "curry",
    ingredients: [i("Toor dal", 70, "g"), i("Gongura leaves", 60, "g"), i("Green chilli", 4, "g"), i("Rice", 90, "g")] },
  { id: "r20", name: "Kadhi Chawal", region: "Rajasthan", slots: ["lunch"], diet: "veg", category: "mixed", season: "summer", minutes: 35, art: "curry",
    ingredients: [i("Curd", 120, "g"), i("Gram flour", 25, "g"), i("Rice", 90, "g"), i("Curry leaves", 4, "leaves")] },
  { id: "r21", name: "Bisi Bele Bath", region: "Karnataka", slots: ["lunch"], diet: "veg", category: "mixed", season: "monsoon", minutes: 45, art: "curry",
    ingredients: [i("Rice", 70, "g"), i("Toor dal", 40, "g"), i("Mixed vegetables", 80, "g"), i("Bisi bele masala", 10, "g")] },
  { id: "r22", name: "Chole Bhature", region: "Punjab", slots: ["lunch"], diet: "veg", category: "protein", season: "winter", minutes: 60, art: "thali",
    ingredients: [i("Chickpeas", 80, "g"), i("Maida", 70, "g"), i("Onion", 50, "g"), i("Chole masala", 8, "g")] },

  // ---- Dinner
  { id: "r23", name: "Palak Paneer & Roti", region: "Punjab", slots: ["dinner"], diet: "veg", category: "protein", season: "winter", minutes: 40, art: "curry",
    ingredients: [i("Paneer", 90, "g"), i("Spinach", 150, "g"), i("Wheat flour", 60, "g"), i("Cream", 15, "ml")] },
  { id: "r24", name: "Malabar Veg Biryani", region: "Kerala", slots: ["dinner"], diet: "veg", category: "mixed", season: "all", minutes: 55, art: "curry",
    ingredients: [i("Kaima rice", 95, "g"), i("Mixed vegetables", 110, "g"), i("Fried onion", 20, "g"), i("Biryani masala", 8, "g")] },
  { id: "r25", name: "Chettinad Chicken", region: "Tamil Nadu", slots: ["dinner"], diet: "nonveg", category: "protein", season: "all", minutes: 50, art: "curry",
    ingredients: [i("Chicken", 160, "g"), i("Chettinad masala", 10, "g"), i("Coconut", 25, "g"), i("Rice", 80, "g")] },
  { id: "r26", name: "Baingan Bharta & Phulka", region: "Punjab", slots: ["dinner"], diet: "vegan", category: "vegetable", season: "winter", minutes: 40, art: "thali",
    ingredients: [i("Brinjal", 180, "g"), i("Tomato", 70, "g"), i("Wheat flour", 60, "g"), i("Green peas", 25, "g")] },
  { id: "r27", name: "Bengali Aloo Posto", region: "West Bengal", slots: ["dinner"], diet: "vegan", category: "vegetable", season: "summer", minutes: 30, art: "curry",
    ingredients: [i("Potato", 150, "g"), i("Poppy seed paste", 20, "g"), i("Nigella seeds", 1, "g"), i("Rice", 85, "g")] },
  { id: "r28", name: "Gatte ki Sabzi", region: "Rajasthan", slots: ["dinner"], diet: "veg", category: "protein", season: "all", minutes: 45, art: "curry",
    ingredients: [i("Gram flour", 70, "g"), i("Curd", 80, "g"), i("Wheat flour", 55, "g"), i("Red chilli powder", 3, "g")] },
  { id: "r29", name: "Axone Pork Stew", region: "Nagaland", slots: ["dinner"], diet: "nonveg", category: "protein", season: "winter", minutes: 65, art: "curry",
    ingredients: [i("Pork", 150, "g"), i("Axone", 12, "g"), i("Bamboo shoot", 40, "g"), i("Rice", 85, "g")] },
  { id: "r30", name: "Assamese Masor Tenga", region: "Assam", slots: ["dinner"], diet: "nonveg", category: "protein", season: "summer", minutes: 35, art: "curry",
    ingredients: [i("Rohu fish", 150, "g"), i("Tomato", 90, "g"), i("Lemon", 10, "ml"), i("Rice", 85, "g")] },
  { id: "r31", name: "Vegetable Kootu & Rice", region: "Tamil Nadu", slots: ["dinner"], diet: "vegan", category: "vegetable", season: "all", minutes: 35, art: "curry",
    ingredients: [i("Ash gourd", 120, "g"), i("Moong dal", 40, "g"), i("Coconut", 20, "g"), i("Rice", 85, "g")] },
  { id: "r32", name: "Goan Mushroom Cafreal", region: "Goa", slots: ["dinner"], diet: "vegan", category: "vegetable", season: "monsoon", minutes: 35, art: "curry",
    ingredients: [i("Mushrooms", 140, "g"), i("Coriander", 20, "g"), i("Green chilli", 4, "g"), i("Pav bread", 1, "pcs")] },
  { id: "r33", name: "Methi Malai Matar", region: "Uttar Pradesh", slots: ["dinner"], diet: "veg", category: "vegetable", season: "winter", minutes: 40, art: "curry",
    ingredients: [i("Fenugreek leaves", 70, "g"), i("Green peas", 60, "g"), i("Cream", 25, "ml"), i("Wheat flour", 55, "g")] },
  { id: "r34", name: "Egg Roast & Appam", region: "Kerala", slots: ["dinner"], diet: "egg", category: "protein", season: "all", minutes: 35, art: "dosa",
    ingredients: [i("Eggs", 2, "pcs"), i("Onion", 90, "g"), i("Appam batter", 120, "ml"), i("Curry leaves", 5, "leaves")] },

  // ---- Snacks
  { id: "r35", name: "Masala Chai & Khakhra", region: "Gujarat", slots: ["snack"], diet: "veg", category: "carb", season: "monsoon", minutes: 10, art: "chai",
    ingredients: [i("Tea leaves", 4, "g"), i("Milk", 120, "ml"), i("Khakhra", 2, "pcs"), i("Ginger", 3, "g")] },
  { id: "r36", name: "Kanda Bhaji", region: "Maharashtra", slots: ["snack"], diet: "vegan", category: "carb", season: "monsoon", minutes: 20, art: "chai",
    ingredients: [i("Onion", 90, "g"), i("Gram flour", 40, "g"), i("Oil", 25, "ml"), i("Ajwain", 1, "g")] },
  { id: "r37", name: "Sundal", region: "Tamil Nadu", slots: ["snack"], diet: "vegan", category: "protein", season: "all", minutes: 20, art: "chai",
    ingredients: [i("Black chana", 60, "g"), i("Coconut", 15, "g"), i("Mustard seeds", 2, "g"), i("Curry leaves", 4, "leaves")] },
  { id: "r38", name: "Dhokla", region: "Gujarat", slots: ["snack", "breakfast"], diet: "veg", category: "protein", season: "summer", minutes: 30, art: "chai",
    ingredients: [i("Gram flour", 60, "g"), i("Curd", 30, "g"), i("Green chilli", 3, "g"), i("Sugar", 6, "g")] },
  { id: "r39", name: "Sprouts Bhel", region: "Maharashtra", slots: ["snack"], diet: "vegan", category: "protein", season: "summer", minutes: 12, art: "chai",
    ingredients: [i("Moong sprouts", 70, "g"), i("Puffed rice", 25, "g"), i("Onion", 30, "g"), i("Lemon", 8, "ml")] },
  { id: "r40", name: "Banana Chips & Filter Coffee", region: "Kerala", slots: ["snack"], diet: "veg", category: "carb", season: "all", minutes: 8, art: "chai",
    ingredients: [i("Banana chips", 35, "g"), i("Coffee powder", 10, "g"), i("Milk", 100, "ml")] },
];

export const byId = (id: string) => RECIPES.find((r) => r.id === id)!;

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const SLOT_TIME: Record<MealSlot, string> = {
  breakfast: "8:00 AM",
  lunch: "1:00 PM",
  snack: "5:00 PM",
  dinner: "8:30 PM",
};

export const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

export const DIET_LABEL: Record<Diet, string> = {
  veg: "Veg",
  vegan: "Vegan",
  egg: "Egg",
  nonveg: "Non-veg",
};
