# Caspian — Meal Planner & Cook Coordination Prototype

A mobile-first visual prototype of the household meal planning app, with realistic mock Indian recipe data. No backend, no real AI, no real SMS/WhatsApp — every interaction is simulated in the browser so the whole experience can be clicked through.

## Design language

Headspace + Groodles: warm, rounded, friendly. Soft cream/oat background, warm saffron-orange primary, deep spice-brown text, sage and berry accents. Big rounded corners, chunky pill buttons, soft blob shapes, playful illustrated food spots rather than clinical stock photos. Generous whitespace, gentle shadows, calm micro-animation.

## Screens

Three tabs with a rounded floating bottom tab bar (adapts to a left rail on wide screens).

**Planner (center tab, landing page)**
- Hero card: next upcoming meal — dish name, date, time, servings, veg/non-veg dot, illustrated food art.
- Cook status chip: "Caspian notified · 7:30 PM" with delivery state.
- Today's meals: breakfast / lunch / dinner / snack cards with meal-type icons, cook time, dietary tags.
- Week strip: horizontal date picker; tapping a date swaps the day's meals below.
- Each meal card has a swap action that animates in an alternative dish from the mock dataset.

**Discover (right tab)**
- Swiggy-style horizontally scrollable rows under headers: Seasonal Picks, High Protein, Quick to Cook, Popular in Kerala, Carb-Rich, Comfort Classics.
- Tapping a card opens a sheet to add it to an upcoming slot, with a confirmation toast.

**Preferences (left tab)**
- Household size stepper, location picker, dietary preference chips, allergy and disliked-ingredient tags, favourite cuisine selection.
- Cook settings: name, phone, WhatsApp/SMS toggle, lead time — display only, clearly marked as simulated.
- "Ask Caspian" free-text box with canned example responses so the interaction reads as real.

## Data

A local mock dataset of ~40 Indian recipes spanning Punjabi, Gujarati, Maharashtrian, Tamil, Kerala, Andhra, Bengali, Rajasthani, Goan and North-Eastern cuisines, each with region, meal type, ingredients per serving, cook time, season and dietary tags. A generated week of meals keeps dishes non-repeating, so the swap and week views behave believably. Structured the same way a real database would be, so wiring a backend later is a swap, not a rewrite.

## Technical notes

- TanStack Start + React, Tailwind v4 tokens in `src/styles.css` (new warm palette + rounded radius scale), shadcn components restyled to the direction.
- Routes: `/` (Planner), `/discover`, `/preferences`, with a shared tab-bar layout.
- Recipes and the generated plan live in a typed mock module plus client state; servings scale ingredient quantities live.
- Illustrated food art generated as image assets in the chosen style.
- SEO head metadata per route.

## Out of scope for this pass

Database, auth, real AI planning, and real cook messaging. Those come next once the look and flow are approved.
