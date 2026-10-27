import { CO2E_PER_KG_FOOD, FOOD_TYPES } from './constants.js'

// Turns a list of donations into impact numbers. Pure function: no React, no storage.
// Only "Shpërndarë" (distributed) donations count as completed; "Marrë" is shown separately.
export function calculateImpact(donations) {
  const completed = donations.filter((d) => d.status === 'distributed')

  // reduce() walks the list once and carries the running totals along.
  const totals = completed.reduce(
    (sum, d) => ({
      portions: sum.portions + d.portions,
      kg: sum.kg + d.kg,
      people: sum.people + d.peopleHelped,
    }),
    { portions: 0, kg: 0, people: 0 }, // starting values
  )

  const inProgressPortions = donations
    .filter((d) => d.status === 'picked_up')
    .reduce((sum, d) => sum + d.portions, 0)

  // { bread: 44, pastry: 24, ... } -> sorted list of food types that have portions
  const portionsByType = completed.reduce((byType, d) => {
    byType[d.foodType] = (byType[d.foodType] ?? 0) + d.portions
    return byType
  }, {})
  const byFoodType = Object.keys(FOOD_TYPES)
    .filter((type) => portionsByType[type] > 0)
    .map((type) => ({ foodType: type, portions: portionsByType[type] }))
    .sort((a, b) => b.portions - a.portions)

  return {
    completedCount: completed.length,
    portions: totals.portions,
    kg: Math.round(totals.kg * 10) / 10, // avoid 2.4000000000000004
    co2Kg: Math.round(totals.kg * CO2E_PER_KG_FOOD), // whole kg: it is an estimate anyway
    people: totals.people,
    inProgressPortions,
    byFoodType,
    recent: [...completed].sort((a, b) => b.distributedAt - a.distributedAt).slice(0, 3),
  }
}
