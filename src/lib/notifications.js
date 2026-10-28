// Notifications are not stored: they are worked out from the donations, like the activity feed.
// Only "when did I last open the bell" is saved, to know which ones are new.
import { FOOD_TYPES, ROLES } from './constants.js'
import { distanceKm, formatDistance } from './distance.js'
import { formatClock, formatCountdown, isUrgent, reservationEndsAt } from './time.js'

const MINUTE = 60 * 1000
const MAX_AGE = 12 * 60 * MINUTE // older events are no longer interesting
const SEEN_KEY = 'stf.notifications.seen'

function foodText(d) {
  return `${d.portions} porcione ${FOOD_TYPES[d.foodType].label.toLowerCase()}`
}

// What `profile` (a business, organization or volunteer) should be told about. Newest first.
// Each item: { id, time, kind, title, body, to }
export function buildNotifications(donations, profile, now) {
  const items = []
  const add = (item) => {
    if (item.time <= now && now - item.time < MAX_AGE) items.push(item)
  }

  if (profile.role === 'business') {
    if (!profile.notify.myDonations) return []
    for (const d of donations.filter((d) => d.businessId === profile.id)) {
      const to = `/donations/${d.id}`
      const collector = ROLES[d.reservedBy]?.label.toLowerCase() ?? 'organizatë'
      if (d.reservedAt) {
        add({ id: `${d.id}-reserved`, time: d.reservedAt, kind: 'reserved', to,
          title: `U rezervua: ${foodText(d)}`,
          body: `Një ${collector} po vjen. Kodi i marrjes: ${d.pickupCode}` })
      }
      if (d.pickedUpAt) {
        add({ id: `${d.id}-picked`, time: d.pickedUpAt, kind: 'picked_up', to,
          title: `U mor: ${foodText(d)}`, body: 'Marrja u konfirmua me kod.' })
      }
      if (d.distributedAt) {
        const stars = d.rating ? ` Vlerësimi: ${'★'.repeat(d.rating.stars)}` : ''
        add({ id: `${d.id}-distributed`, time: d.distributedAt, kind: 'distributed', to,
          title: `U shpërnda: ${foodText(d)}`, body: `${d.peopleHelped} persona u ndihmuan.${stars}` })
      }
      if (d.status === 'published' && d.pickupDeadline <= now) {
        add({ id: `${d.id}-expired`, time: d.pickupDeadline, kind: 'expired', to,
          title: `Skadoi pa u marrë: ${foodText(d)}`, body: 'Herën tjetër provo një afat pak më të gjatë.' })
      }
    }
  } else {
    const origin = { lat: profile.lat, lng: profile.lng }

    if (profile.notify.urgentNearby) {
      for (const d of donations.filter((d) => isUrgent(d, now))) {
        const km = distanceKm(origin, d)
        if (km > profile.radiusKm) continue
        add({ id: `${d.id}-urgent`, kind: 'urgent', to: `/donations/${d.id}`,
          time: Math.max(d.createdAt ?? 0, d.pickupDeadline - 60 * MINUTE), // when it became urgent
          title: 'Ushqim urgjent afër teje',
          body: `${foodText(d)} te ${d.businessName} · ${formatDistance(km)} · deri ${formatClock(d.pickupDeadline)}` })
      }
    }

    if (profile.notify.myReservations) {
      for (const d of donations.filter((d) => d.reservedBy === profile.role)) {
        const to = `/donations/${d.id}`
        if (d.status === 'reserved') {
          const msLeft = reservationEndsAt(d) - now
          if (msLeft > 0 && msLeft < 10 * MINUTE) {
            add({ id: `${d.id}-expiring`, kind: 'expiring', to, time: reservationEndsAt(d) - 10 * MINUTE,
              title: 'Rezervimi yt po skadon',
              body: `${foodText(d)} te ${d.businessName} – merre brenda ${formatCountdown(msLeft)}.` })
          }
        }
        if (d.status === 'picked_up') {
          add({ id: `${d.id}-distribute`, kind: 'reminder', to, time: d.pickedUpAt,
            title: 'Mos harro shpërndarjen', body: `Shëno sa persona u ndihmuan me ${foodText(d)}.` })
        }
      }
    }
  }

  return items.sort((a, b) => b.time - a.time).slice(0, 20)
}


// ---- "Seen" time per role ----

export function getLastSeen(role) {
  return Number(localStorage.getItem(`${SEEN_KEY}.${role}`)) || 0
}

export function markSeen(role, time = Date.now()) {
  localStorage.setItem(`${SEEN_KEY}.${role}`, String(time))
}
