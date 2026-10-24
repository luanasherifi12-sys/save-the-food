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
