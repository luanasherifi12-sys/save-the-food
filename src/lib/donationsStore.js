// The only place that reads and writes donations.
// Later we replace the inside of these functions with Supabase; components stay the same.
import { createSampleDonations } from '../data/sampleDonations.js'
import { isAvailable } from './time.js'

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
  let donations = []
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Anything that is not a list (nothing saved, an old format) counts as empty.
    if (Array.isArray(saved)) donations = saved
  } catch {
    // Broken JSON -> start with an empty list.
  }

  const now = Date.now()
  if (donations.some((d) => isAvailable(d, now))) {
    return donations
  }

  // Nothing left to reserve -> bring the sample data back to life so the app never looks empty.
  const refreshed = withFreshSamples(donations, now)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed))
  return refreshed
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
