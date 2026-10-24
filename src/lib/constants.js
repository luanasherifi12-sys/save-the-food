// Shared constants and Albanian UI labels used across the app.

export const ROLE_STORAGE_KEY = 'stf.role'

// The three roles. Organization and volunteer share the same screens in Phase 1.
export const ROLES = {
  business: {
    id: 'business',
    label: 'Biznes',
    description: 'Furrë, restorant, market ose hotel me ushqim të tepërt',
    icon: '🏪',
    homePath: '/publish',
  },
  organization: {
    id: 'organization',
    label: 'Organizatë',
    description: 'Organizatë humanitare, strehimore ose bankë ushqimore',
    icon: '🤝',
    homePath: '/browse',
  },
  volunteer: {
    id: 'volunteer',
    label: 'Vullnetar',
    description: 'E merr ushqimin dhe e çon te kush ka nevojë',
    icon: '🚲',
    homePath: '/browse',
  },
}

const COLLECTOR_NAV = [
  { to: '/browse', label: 'Ushqimi', icon: '🗺️' },
  { to: '/impact', label: 'Ndikimi', icon: '📊' },
]

// Bottom navigation items for each role.
export const NAV_ITEMS = {
  business: [
    { to: '/publish', label: 'Publiko', icon: '➕' },
    { to: '/my-donations', label: 'Donacionet', icon: '📦' },
    { to: '/impact', label: 'Ndikimi', icon: '📊' },
  ],
  organization: COLLECTOR_NAV,
  volunteer: COLLECTOR_NAV,
}

// Food types. kgPerPortion is used to estimate the weight automatically.
export const FOOD_TYPES = {
  bread: { label: 'Bukë', icon: '🍞', kgPerPortion: 0.15 },
  pastry: { label: 'Pastë', icon: '🥐', kgPerPortion: 0.1 },
  meal: { label: 'Gatim', icon: '🍲', kgPerPortion: 0.4 },
  produce: { label: 'Fruta/Perime', icon: '🍎', kgPerPortion: 0.3 },
  other: { label: 'Tjetër', icon: '📦', kgPerPortion: 0.25 },
}

export function estimateKg(foodType, portions) {
  const kg = FOOD_TYPES[foodType].kgPerPortion * portions
  return Math.round(kg * 10) / 10 // one decimal
}

export const STORAGE_TYPES = {
  cold: { label: 'E ftohtë', icon: '❄️' },
  hot: { label: 'E ngrohtë', icon: '🔥' },
  room: { label: 'Temperaturë dhome', icon: '🌡️' },
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
