// Demo history of the last days, so the impact chart and the landing page have something to show.
// The numbers are made up but STABLE: the same day always gives the same numbers (no Math.random),
// so they don't jump on every reload. Replaced by real data when we move to Supabase.

const DAY = 24 * 60 * 60 * 1000

export const HISTORY_DAYS = 14

// A repeatable "random" number between 0 and 1 for a given integer.
function pseudoRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export function startOfDay(timestamp) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

// One entry per past day (oldest first), NOT including today – today comes from the live data.
// { date, portions, kg, people, donations }
export function createDailyHistory(now, days = HISTORY_DAYS) {
  const today = startOfDay(now)
  const history = []

  for (let daysAgo = days - 1; daysAgo >= 1; daysAgo--) {
    const date = new Date(today - daysAgo * DAY)
    const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const growth = 1 + (days - daysAgo) * 0.03 // a young pilot that grows a little every day

    const portions = Math.round((isWeekend ? 45 : 70) * growth + pseudoRandom(seed) * 40)
    history.push({
      date: date.getTime(),
      portions,
      kg: Math.round(portions * 0.22 * 10) / 10,
      people: Math.round(portions * 0.55),
      donations: Math.max(2, Math.round(portions / 14)),
    })
  }
  return history
}

// Adds up a list of days: { portions, kg, people, donations }
export function sumDays(days) {
  return days.reduce(
    (sum, day) => ({
      portions: sum.portions + day.portions,
      kg: Math.round((sum.kg + day.kg) * 10) / 10,
      people: sum.people + day.people,
      donations: sum.donations + day.donations,
    }),
    { portions: 0, kg: 0, people: 0, donations: 0 },
  )
}
