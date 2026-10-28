import { FOOD_TYPES, ROLES } from './constants.js'

// Turns donations into a timeline of what happened ("Furra Dardania published 20 portions...").
// Every timestamp on a donation is one event. Newest first.
export function buildActivity(donations, now, limit = 6) {
  const events = []

  for (const d of donations) {
    const food = `${d.portions} porcione ${FOOD_TYPES[d.foodType].label.toLowerCase()}`
    const collector = ROLES[d.reservedBy]?.label.toLowerCase() ?? 'organizatë'

    if (d.createdAt) {
      events.push({ id: `${d.id}-published`, time: d.createdAt, kind: 'published', text: `${d.businessName} publikoi ${food}` })
    }
    if (d.reservedAt) {
      events.push({ id: `${d.id}-reserved`, time: d.reservedAt, kind: 'reserved', text: `Një ${collector} rezervoi ${food} te ${d.businessName}` })
    }
    if (d.pickedUpAt) {
      events.push({ id: `${d.id}-picked`, time: d.pickedUpAt, kind: 'picked_up', text: `U morën ${food} nga ${d.businessName}` })
    }
    if (d.distributedAt) {
      events.push({ id: `${d.id}-distributed`, time: d.distributedAt, kind: 'distributed', text: `${d.peopleHelped} persona morën ushqim nga ${d.businessName}` })
    }
  }

  return events
    .filter((event) => event.time <= now) // sample data may hold times a few ms ahead
    .sort((a, b) => b.time - a.time)
    .slice(0, limit)
}
