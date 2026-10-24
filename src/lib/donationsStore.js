// The only place that reads and writes donations.
// Later we replace the inside of these functions with Supabase; components stay the same.
import { createSampleDonations } from '../data/sampleDonations.js'
import { isAvailable, releaseIfExpired } from './time.js'

const STORAGE_KEY = 'stf.donations'
const CHANGE_EVENT = 'stf:donations-changed'

function isSample(donation) {
  return donation.id.startsWith('sample-')
}

// Replaces the old sample donations with new ones relative to `now`; real donations are kept.
function withFreshSamples(donations, now) {
  return [...donations.filter((d) => !isSample(d)), ...createSampleDonations(now)]
}

function readDonations() {
  let saved = []
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Anything that is not a list (nothing saved, an old format) counts as empty.
    if (Array.isArray(parsed)) saved = parsed
  } catch {
    // Broken JSON -> start with an empty list.
  }

  const now = Date.now()
  // Expired reservations go back to "Publikuar".
  let donations = saved.map((d) => releaseIfExpired(d, now))
  let changed = donations.some((d, index) => d !== saved[index])

  // Nothing left to reserve -> bring the sample data back to life so the app never looks empty.
  if (!donations.some((d) => isAvailable(d, now))) {
    donations = withFreshSamples(donations, now)
    changed = true
  }

  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(donations))
  return donations
}

function writeDonations(donations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donations))
  // The browser's "storage" event only reaches OTHER tabs,
  // so we also fire our own event to update this tab.
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getDonations() {
  return readDonations()
}

export function getDonationById(id) {
  return getDonations().find((donation) => donation.id === id) ?? null
}

export function saveDonations(donations) {
  writeDonations(donations)
}

function generatePickupCode() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0') // "0000"–"9999"
}

// Creates a new published donation from the form fields and saves it.
export function addDonation(fields) {
  const donation = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    status: 'published',
    pickupCode: generatePickupCode(),
    reservedAt: null,
    reservedBy: null,
    pickedUpAt: null,
    distributedAt: null,
    peopleHelped: null,
    ...fields,
  }
  saveDonations([donation, ...getDonations()])
  return donation
}

// Reads the LATEST data, lets `change` decide, and saves only if it is allowed.
// `change(donation, now)` returns { ok: true, donation: updated } or { ok: false, reason }.
// Reading fresh data first matters: another tab may have reserved the same food a second ago.
function updateDonation(id, change) {
  const donations = getDonations()
  const index = donations.findIndex((d) => d.id === id)
  if (index === -1) return { ok: false, reason: 'not-found' }

  const result = change(donations[index], Date.now())
  if (!result.ok) return result

  const updated = [...donations]
  updated[index] = result.donation
  saveDonations(updated)
  return result
}

// Published -> Reserved
export function reserveDonation(id, role) {
  return updateDonation(id, (donation, now) => {
    if (!isAvailable(donation, now)) return { ok: false, reason: 'not-available' }
    return { ok: true, donation: { ...donation, status: 'reserved', reservedAt: now, reservedBy: role } }
  })
}

// Reserved -> Published (the collector changed their mind)
export function cancelReservation(id) {
  return updateDonation(id, (donation) => {
    if (donation.status !== 'reserved') return { ok: false, reason: 'not-reserved' }
    return { ok: true, donation: { ...donation, status: 'published', reservedAt: null, reservedBy: null } }
  })
}

// Reserved -> Picked up, only with the 4-digit code the business shows.
export function confirmPickup(id, code) {
  return updateDonation(id, (donation, now) => {
    // An expired reservation was already released to "published" by getDonations().
    if (donation.status !== 'reserved') return { ok: false, reason: 'not-reserved' }
    if (code !== donation.pickupCode) return { ok: false, reason: 'wrong-code' }
    return { ok: true, donation: { ...donation, status: 'picked_up', pickedUpAt: now } }
  })
}

// Picked up -> Distributed, with the number of people helped (for the impact dashboard).
export function markDistributed(id, peopleHelped) {
  return updateDonation(id, (donation, now) => {
    if (donation.status !== 'picked_up') return { ok: false, reason: 'not-picked-up' }
    if (!(peopleHelped >= 1)) return { ok: false, reason: 'invalid-people' }
    return { ok: true, donation: { ...donation, status: 'distributed', distributedAt: now, peopleHelped } }
  })
}

export function resetDonations() {
  writeDonations(withFreshSamples(readDonations(), Date.now()))
}

// Calls `callback` whenever donations change, in this tab or in another one.
// Returns a function that stops listening (used by useEffect cleanup).
export function subscribe(callback) {
  function handleStorage(event) {
    // event.key is null when localStorage was cleared completely
    if (event.key === STORAGE_KEY || event.key === null) callback()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(CHANGE_EVENT, callback)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}
