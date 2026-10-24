import { URGENT_MINUTES } from './constants.js'

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

// A donation can still be reserved: it is published and its pickup deadline has not passed.
export function isAvailable(donation, now) {
  return donation.status === 'published' && donation.pickupDeadline > now
}

// "Duhet marrë së shpejti": still available, but less than URGENT_MINUTES left.
export function isUrgent(donation, now) {
  return isAvailable(donation, now) && donation.pickupDeadline - now < URGENT_MINUTES * MINUTE
}
