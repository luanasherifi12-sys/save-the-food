// "14:09" – always 24-hour, independent of the browser language.
export function formatClock(timestamp) {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// A donation can still be reserved: it is published and its pickup deadline has not passed.
export function isAvailable(donation, now) {
  return donation.status === 'published' && donation.pickupDeadline > now
}
