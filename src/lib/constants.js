// Shared constants and Albanian UI labels used across the app.
import {
  Apple,
  Bike,
  ChartColumn,
  CirclePlus,
  Croissant,
  Flame,
  HeartHandshake,
  MapIcon,
  Package,
  ShoppingBag,
  Snowflake,
  Soup,
  Store,
  Thermometer,
  Wheat,
} from 'lucide-react'

// Icons are lucide-react components (SVG), stored as `Icon`.
// Render them like <item.Icon className="size-6" />; they take the current text color.

export const ROLE_STORAGE_KEY = 'stf.role'

// The three roles. Organization and volunteer share the same screens in Phase 1.
export const ROLES = {
  business: {
    id: 'business',
    label: 'Biznes',
    description: 'Furrë, restorant, market ose hotel me ushqim të tepërt',
    Icon: Store,
    homePath: '/publish',
  },
  organization: {
    id: 'organization',
    label: 'Organizatë',
    labelDative: 'organizatës', // "Jepja kodin organizatës"
    description: 'Organizatë humanitare, strehimore ose bankë ushqimore',
    Icon: HeartHandshake,
    homePath: '/browse',
  },
  volunteer: {
    id: 'volunteer',
    label: 'Vullnetar',
    labelDative: 'vullnetarit',
    description: 'E merr ushqimin dhe e çon te kush ka nevojë',
    Icon: Bike,
    homePath: '/browse',
  },
}

const COLLECTOR_NAV = [
  { to: '/browse', label: 'Ushqimi', Icon: MapIcon },
  { to: '/pickups', label: 'Marrjet', Icon: ShoppingBag },
  { to: '/impact', label: 'Ndikimi', Icon: ChartColumn },
]

// Bottom navigation items for each role.
export const NAV_ITEMS = {
  business: [
    { to: '/publish', label: 'Publiko', Icon: CirclePlus },
    { to: '/my-donations', label: 'Donacionet', Icon: Package },
    { to: '/impact', label: 'Ndikimi', Icon: ChartColumn },
  ],
  organization: COLLECTOR_NAV,
  volunteer: COLLECTOR_NAV,
}

// Food types. kgPerPortion is used to estimate the weight automatically.
export const FOOD_TYPES = {
  bread: { label: 'Bukë', Icon: Wheat, kgPerPortion: 0.15 },
  pastry: { label: 'Pastë', Icon: Croissant, kgPerPortion: 0.1 },
  meal: { label: 'Gatim', Icon: Soup, kgPerPortion: 0.4 },
  produce: { label: 'Fruta/Perime', Icon: Apple, kgPerPortion: 0.3 },
  other: { label: 'Tjetër', Icon: Package, kgPerPortion: 0.25 },
}

// { bread: { label, Icon } } -> [{ value: 'bread', label, Icon }] for ChipGroup
export function toOptions(map) {
  return Object.entries(map).map(([value, item]) => ({ value, label: item.label, Icon: item.Icon }))
}

export function estimateKg(foodType, portions) {
  const kg = FOOD_TYPES[foodType].kgPerPortion * portions
  return Math.round(kg * 10) / 10 // one decimal
}

export const STORAGE_TYPES = {
  cold: { label: 'E ftohtë', Icon: Snowflake },
  hot: { label: 'E ngrohtë', Icon: Flame },
  room: { label: 'Temperaturë dhome', Icon: Thermometer },
}

// "none" is a real choice: the business must always answer the allergen question.
export const ALLERGENS = {
  none: 'Asnjë',
  gluten: 'Gluten',
  dairy: 'Qumësht',
  eggs: 'Vezë',
  nuts: 'Arra',
  soy: 'Soja',
  fish: 'Peshk',
  sesame: 'Susam',
}

// Published -> Reserved -> Picked up -> Distributed
export const STATUSES = {
  published: { label: 'Publikuar' },
  reserved: { label: 'Rezervuar' },
  picked_up: { label: 'Marrë' },
  distributed: { label: 'Shpërndarë' },
}

export const RESERVATION_MINUTES = 30 // a reservation expires if not picked up in time
export const URGENT_MINUTES = 60 // "Duhet marrë së shpejti" below this

export const PRISHTINA_CENTER = { lat: 42.6629, lng: 21.1655 }

// Until we have login, every business user acts as this demo business.
export const DEMO_BUSINESS = {
  id: 'demo-business',
  name: 'Furra Ime (demo)',
  address: 'Pejton',
  lat: 42.6585,
  lng: 21.159,
}
