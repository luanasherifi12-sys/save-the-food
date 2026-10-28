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
- Responsive with Tailwind breakpoints: phone < 768 (no prefix), tablet `md:` 768–1023,
  computer `lg:` ≥ 1024. The phone layout must not change: new styles go ONLY behind `md:`/`lg:`.
  Tablet keeps the bottom nav; computer has the nav in the header and content max 1200px.
  Use `useMediaQuery(DESKTOP_QUERY)` only when JavaScript must behave differently (e.g. the
  Leaflet map cannot be hidden with CSS). `contents` on a wrapper keeps the phone layout unchanged.
- Big buttons, one main action per screen, minimal typing (chips/buttons instead of inputs).
- Colors (from the presentation): `brand-900` #063B2A, `brand-700` #1B5E20 (primary),
  `brand-500` #1F9D63, `brand-50` #EAF7F0, `surface` #F4F7F6, `ink` #26352E.
  Warm bread tones: `cream-50/100`, `crust-500/700`.
- Fonts: Inter only. Headings use `font-display` (Inter, semibold, letter-spacing -0.02em).
- Professional look: corners are small (`--radius-xl/2xl/3xl` = 8/10/12px in `src/index.css`),
  info tags are neutral outlines (`DonationTags`), badges are small rectangles, no heavy shadows,
  headings `font-semibold` (not bold). Avoid big pastel pills and thick colored borders.
- Dark mode: automatic via `prefers-color-scheme` in `src/index.css`. Only token VALUES change there,
  so components need no `dark:` classes. Rules that keep it working:
  use `bg-card` (never `bg-white`) for cards, chips and inputs; use `bg-header` for the green header
  bar and `text-header-soft` for light text on it (both stay dark/light in both themes).
  `bg-white` is only for things that must stay white in both themes (e.g. the active header pill).
- Map pins: green drop pins with food icons (see mockup in the presentation).
- Icons: lucide-react SVG components, no emoji in the UI. Constants store the component as `Icon`
  (render `<item.Icon className="size-5" />`). Use `FoodIcon` for food types and `InlineIcon`
  for an icon inside a line of text. Map pins get SVG text generated once at load (see DonationMap).
- PWA: `public/manifest.webmanifest` + icons in `public/icons/` (source: `docs/pwa-icon/icon.html`).
  No service worker (no offline mode). Headers use `env(safe-area-inset-top)` for phones with a notch.

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

## Design: "Elegant i ngrohtë" (chosen by the user)
- Paper-cream surfaces, Fraunces serif headings (`font-display`), forest green, gold (crust) and
  terracotta (urgent) accents, soft 12–20px corners, warm shadows. All in `@theme` tokens in index.css.
- Fraunces has NO tabular digits: numbers that tick every second (countdowns) use the sans font.
- Theme: Profili -> Automatike / E çelët / E errët (`data-theme` on <html>, lib/profileStore.js).

## Decisions
- All data access goes through `src/lib/donationsStore.js`, so Supabase can replace it later
  without changing components.
- The first page (`RoleSelectPage`) is a landing page: live hero numbers (`useCountUp`), live map on
  computers only, "Si funksionon", live activity (`lib/activity.js` + `ActivityFeed`), footer.
- `lib/history.js` makes a STABLE 14-day demo history (no Math.random) for the landing numbers and the
  impact chart. Always labelled "të dhëna demo" in the UI. Replaced by real data with Supabase.
- Feedback after actions: `showToast(message)` from `lib/toast.js`; `<Toaster />` is in App.jsx.
- Animations are defined in `index.css` (`--animate-*`) and switched off under prefers-reduced-motion.
  Page fade-in uses `backwards` fill so no transform stays behind (it would break sticky/fixed).
- The map is loaded with `React.lazy` (`LazyDonationMap`); render maps only where they are visible
  (useMediaQuery), not just hidden with CSS, or phones download Leaflet for nothing.
- Data lives in localStorage. Other tabs refresh instantly via the `storage` event.
- Sample data uses times **relative to now** (e.g. deadline in 45 min) so the app never looks empty.
  When fewer than 4 donations are available (published + deadline not passed), the `sample-*`
  donations are recreated relative to now. Real (non-sample) donations are always kept, and so
  are samples in use in a demo (have `updatedAt` and are reserved/picked up/distributed).
  The refresh is only saved if it increases the number available (no endless refreshing).
  "Rivendos të dhënat shembull" is a full reset. Demo only, removed with Supabase.
- Every status change sets `updatedAt` on the donation.
- Profiles (`lib/profileStore.js`, `useProfile`): one per role on this device until Supabase accounts.
  The business profile keeps id `demo-business` so the sample donations stay "mine".
- Notifications (`lib/notifications.js`) are computed from donations + profile preferences; only the
  "last seen" time is stored. Ratings live on the donation (`rating: { stars, tags, ratedAt }`).
- Achievements (`lib/badges.js`) and the weekly leaderboard (`lib/leaderboard.js`, demo + live)
  are computed, never stored. Reports: `lib/reports.js` (CSV with BOM and ";" for Excel) + print CSS.
- NEXT: Supabase (auth with email + password / magic link, shared data, realtime). Phone/SMS login
  needs a paid SMS provider: only if the user decides to pay.
- "Si herën e kaluar?" on the publish form prefills it from the business's latest donation
  (the business still checks and taps Publiko; nothing is published automatically).
- Share: `ShareDonationButton` uses the Web Share API on phones, the clipboard on computers,
  and a WhatsApp link as a last fallback. A shared `/donations/:id` link opened without a role is
  remembered (`state.from`) and opened right after the person picks a role.
- CO₂ on the impact panel = kg × `CO2E_PER_KG_FOOD` (2.5, FAO "Food Wastage Footprint" 2013). An estimate.
- Times are always shown in 24-hour format ("14:09"), as used in Kosovo.
- Kg is estimated automatically from food type × portions; the business can optionally edit it.
- Organization and Volunteer share the same screens in Phase 1 (only the role label differs).
  Without login, "my pickups" = donations whose `reservedBy` equals the current role.
- Status changes go through store functions (`reserveDonation`, `confirmPickup`, `markDistributed`,
  `cancelReservation`) that re-read the latest data and return `{ ok }` or `{ ok: false, reason }`.
- Reservation expiry and urgency are computed from timestamps (no server timers).
- Distance: browser geolocation, fallback to Prishtina center; Haversine formula.

## Deployment
- GitHub: https://github.com/luanasherifi12-sys/save-the-food (public)
- Live: https://save-the-food-tau.vercel.app (Vercel project `save-the-food`)
- Vercel is connected to the GitHub repo: every push to `main` deploys automatically.
- `vercel.json` rewrites all paths to `index.html` so deep links like `/donations/:id` work.
- `.env.local` (Vercel token) is created by the Vercel CLI and must stay out of Git.
- Link previews: Open Graph + Twitter tags in `index.html` use the FULL live URL. If the domain
  changes, update `og:url`, `og:image` and `twitter:image`. The image is `public/og-image.png`
  (1200×630); its source is `docs/og-image/og.html`, screenshotted at exactly 1200×630.

## Commands
- `npm run dev` – start dev server (http://localhost:5173)
- `npm run build` – production build
- `npm run preview` – preview the build
