// Achievements ("arritje") worked out from the donations. Nothing is stored: they unlock by themselves.
import { CircleGauge, Leaf, Medal, Sprout, Star, Users, Zap } from 'lucide-react'
import { CO2E_PER_KG_FOOD } from './constants.js'

const MINUTE = 60 * 1000

// Ratings this business received: { average, count }
export function ratingSummary(donations) {
  const ratings = donations.map((d) => d.rating?.stars).filter(Boolean)
  if (ratings.length === 0) return { average: 0, count: 0 }
  const average = ratings.reduce((sum, stars) => sum + stars, 0) / ratings.length
  return { average: Math.round(average * 10) / 10, count: ratings.length }
}

// One badge: progress from 0 to 1, earned when it reaches 1
function badge(id, Icon, title, description, current, goal, unit = '') {
  const progress = Math.min(1, current / goal)
  return {
    id,
    Icon,
    title,
    description,
    earned: progress >= 1,
    progress,
    progressText: `${Math.min(current, goal).toLocaleString('sq-AL')} / ${goal.toLocaleString('sq-AL')}${unit}`,
  }
}

// `mine`: the donations of this business, or reserved by this organization/volunteer
export function computeBadges(mine, role) {
  const done = mine.filter((d) => d.status === 'distributed')
  const portions = done.reduce((sum, d) => sum + d.portions, 0)
  const people = done.reduce((sum, d) => sum + d.peopleHelped, 0)
  const co2 = Math.round(done.reduce((sum, d) => sum + d.kg, 0) * CO2E_PER_KG_FOOD)

  const common = [
    badge('first', Sprout, 'Hapi i parë', 'Donacioni i parë i shpërndarë', done.length, 1),
    badge('portions-50', Medal, '50 porcione', 'Porcione të shpëtuara gjithsej', portions, 50),
    badge('portions-100', Medal, '100 porcione', 'Porcione të shpëtuara gjithsej', portions, 100),
    badge('climate', Leaf, 'Mbrojtës i klimës', 'CO₂ e shmangur', co2, 25, ' kg'),
  ]

  if (role === 'business') {
    const { average, count } = ratingSummary(done)
    const quickReservations = mine.filter((d) => d.reservedAt && d.createdAt && d.reservedAt - d.createdAt <= 15 * MINUTE)
    return [
      ...common,
      badge('loved', Star, 'Yje të pastra', 'Mesatarja 4,5★ me të paktën 2 vlerësime', count >= 2 && average >= 4.5 ? 1 : 0, 1),
      badge('wanted', Zap, 'Shumë i kërkuar', 'Rezervuar brenda 15 minutash', quickReservations.length, 1),
    ]
  }

  const quickPickups = mine.filter((d) => d.pickedUpAt && d.reservedAt && d.pickedUpAt - d.reservedAt <= 15 * MINUTE)
  return [
    ...common,
    badge('people-50', Users, 'Zemër e madhe', 'Persona të ndihmuar', people, 50),
    badge('fast', CircleGauge, 'Ndihmë e shpejtë', 'Marrë brenda 15 minutash pas rezervimit', quickPickups.length, 1),
  ]
}
