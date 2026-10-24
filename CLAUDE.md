# SAVE THE FOOD

Civic-tech platform in Prishtina that connects businesses with surplus food (bakeries, restaurants,
markets, hotels) to humanitarian organizations and volunteers before the food becomes waste.

Flow: business publishes surplus → it appears on the map → organization/volunteer reserves it →
picks it up (confirmed with a code) → distributes it.

## Working with the user
- The user is a student learning web development. **Always answer in Albanian.**
  Code, comments and file names are in English. All UI text is in Albanian.
- Before writing code, explain the plan briefly and wait for approval.
- Work **one step at a time**. After each step: stop, explain how to test it in the browser,
  explain new concepts (useState, props, etc.) using examples from our code, and suggest a Git commit.
- Never install packages without asking and explaining why.
- Never delete files without asking.
- Never put passwords or API keys in code. Use `.env` (already in `.gitignore`).
- Prefer simple, standard solutions. No unnecessary libraries.

## Tech stack
- React + Vite (JavaScript, not TypeScript)
- Tailwind CSS v4 (via `@tailwindcss/vite`, tokens in `src/index.css` under `@theme`)
- React-Leaflet + OpenStreetMap for the map
- react-router-dom for pages
- Supabase (auth + DB + realtime) comes **later**. For now: sample data in localStorage.
- Deploy: Vercel

## Design
- Mobile-first: used mostly on phones by workers with busy hands.
- Big buttons, one main action per screen, minimal typing (chips/buttons instead of inputs).
- Colors (from the presentation): `brand-900` #063B2A, `brand-700` #1B5E20 (primary),
  `brand-500` #1F9D63, `brand-50` #EAF7F0, `surface` #F4F7F6, `ink` #26352E.
  Warm bread tones: `cream-50/100`, `crust-500/700`.
- Fonts: Inter (text), Space Grotesk (headings, class `font-display`).
- Map pins: green drop pins with food icons (see mockup in the presentation).

## Phase 1 scope (build only this)
1. Business publishes food in under 60 seconds: type (bread, pastry, cooked meal,
   fruit/vegetables, other), portions, pickup deadline, storage (cold/hot/room temperature),
   allergens (required, "none" is a valid choice), optional note.
2. Map + list for organizations/volunteers: a pin per donation, filters (type, distance,
   urgency), card with details and countdown.
3. "Duhet marrë së shpejti" badge when less than 60 minutes remain.
4. Statuses: Publikuar → Rezervuar → Marrë → Shpërndarë. A reservation expires after
   30 minutes if not picked up. Pickup is confirmed with a 4-digit code that the business sees.
5. Impact dashboard: portions saved, kg, completed donations, people helped
   (entered by the organization when distributing).
6. Role selection at start (Biznes / Organizatë / Vullnetar), no real login yet.

NOT in Phase 1: notifications, profile verification, AI prediction, other cities.

## Decisions
- All data access goes through `src/lib/donationsStore.js`, so Supabase can replace it later
  without changing components.
- Data lives in localStorage. Other tabs refresh instantly via the `storage` event.
- Sample data uses times **relative to now** (e.g. deadline in 45 min) so the app never looks empty.
- Kg is estimated automatically from food type × portions; the business can optionally edit it.
- Organization and Volunteer share the same screens in Phase 1 (only the role label differs).
- Reservation expiry and urgency are computed from timestamps (no server timers).
- Distance: browser geolocation, fallback to Prishtina center; Haversine formula.

## Commands
- `npm run dev` – start dev server (http://localhost:5173)
- `npm run build` – production build
- `npm run preview` – preview the build
