import { RESERVATION_MINUTES, URGENT_MINUTES } from './constants.js'

const MINUTE = 60 * 1000

function pad(number) {
  return String(number).padStart(2, '0') // 7 -> "07"
}

// "14:09" – always 24-hour, independent of the browser language.
export function formatClock(timestamp) {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Time left: "1 orë 20 min" when an hour or more is left, otherwise "16 min 56 s".
// Units are written out so it is never confused with a clock time like "16:56".
export function formatCountdown(msLeft) {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours} orë ${pad(minutes)} min`
  return `${minutes} min ${pad(seconds)} s`
}

// "tani", "para 5 min", "para 1 ore", "para 3 orësh", or the clock time for older events.
export function formatTimeAgo(timestamp, now) {
  const minutes = Math.floor((now - timestamp) / MINUTE)
  if (minutes < 1) return 'tani'
  if (minutes < 60) return `para ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return 'para 1 ore'
  if (hours < 12) return `para ${hours} orësh`
  return formatClock(timestamp)
}

// A donation can still be reserved: it is published and its pickup deadline has not passed.
export function isAvailable(donation, now) {
  return donation.status === 'published' && donation.pickupDeadline > now
}

// When a reservation runs out if the food is not picked up.
export function reservationEndsAt(donation) {
  return donation.reservedAt + RESERVATION_MINUTES * MINUTE
}

// A reservation older than RESERVATION_MINUTES is released: the food becomes "Publikuar" again.
// Pure function: returns the same object if nothing changes, otherwise a new one.
export function releaseIfExpired(donation, now) {
  if (donation.status !== 'reserved' || reservationEndsAt(donation) > now) return donation
  return { ...donation, status: 'published', reservedAt: null, reservedBy: null }
}

// "Duhet marrë së shpejti": still available, but less than URGENT_MINUTES left.
export function isUrgent(donation, now) {
  return isAvailable(donation, now) && donation.pickupDeadline - now < URGENT_MINUTES * MINUTE
}
