// The profile of the person using the app (one per role on this device, until we have real accounts).
// Same pattern as donationsStore: the only place that reads/writes profiles, so Supabase can replace it.
import { DEMO_BUSINESS, PRISHTINA_CENTER } from './constants.js'

const STORAGE_KEY = 'stf.profiles'
const CHANGE_EVENT = 'stf:profile-changed'

const COMMON_DEFAULTS = {
  phone: '',
  email: '',
  // Which notifications this person wants (see lib/notifications.js)
  notify: { urgentNearby: true, myReservations: true, myDonations: true },
}

// What a brand-new profile looks like for each role
const DEFAULTS = {
  business: {
    id: DEMO_BUSINESS.id, // the sample "Furra Ime (demo)" donations belong to this id
    name: DEMO_BUSINESS.name,
    address: DEMO_BUSINESS.address,
    lat: DEMO_BUSINESS.lat,
    lng: DEMO_BUSINESS.lng,
    openingHours: '07:00 – 21:00',
    pickupNote: '',
  },
  organization: {
    id: 'demo-organization',
    name: 'Kuzhina e Lagjes (demo)',
    address: 'Qendra',
    lat: PRISHTINA_CENTER.lat,
    lng: PRISHTINA_CENTER.lng,
    peopleServed: 80, // people per day
    radiusKm: 5, // "urgent food nearby" notifications within this distance
  },
  volunteer: {
    id: 'demo-volunteer',
    name: 'Vullnetar (demo)',
    address: 'Qendra',
    lat: PRISHTINA_CENTER.lat,
    lng: PRISHTINA_CENTER.lng,
    vehicle: 'bike',
    radiusKm: 3,
  },
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

// Saved values on top of the defaults, so new fields get a default automatically.
export function getProfile(role) {
  const saved = readAll()[role] ?? {}
  return {
    ...COMMON_DEFAULTS,
    ...DEFAULTS[role],
    ...saved,
    notify: { ...COMMON_DEFAULTS.notify, ...saved.notify },
    role,
  }
}

export function saveProfile(role, changes) {
  const all = readAll()
  all[role] = { ...all[role], ...changes }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeToProfile(callback) {
  function handleStorage(event) {
    if (event.key === STORAGE_KEY || event.key === null) callback()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

// ---- Theme (Automatike / E çelët / E errët) ----

const THEME_KEY = 'stf.theme'

// 'system' | 'light' | 'dark'
export function getTheme() {
  return localStorage.getItem(THEME_KEY) ?? 'system'
}

// Sets data-theme on <html>; index.css uses it to force light or dark colors.
export function applyTheme(theme = getTheme()) {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', theme)
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}
