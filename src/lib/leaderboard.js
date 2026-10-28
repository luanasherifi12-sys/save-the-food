// "Bizneset e javës": portions saved per business this week.
// Earlier days of the week are DEMO numbers (stable per business and week, like lib/history.js);
// today's distributed donations are real. Replaced by real data with Supabase.

const DAY = 24 * 60 * 60 * 1000

// Monday 00:00 of the current week
function startOfWeek(now) {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  const daysSinceMonday = (date.getDay() + 6) % 7
  return date.getTime() - daysSinceMonday * DAY
}

// A repeatable number 0..1 from a text (e.g. business id + week)
function pseudoRandom(text) {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

export function weeklyLeaderboard(donations, now, limit = 5) {
  const weekStart = startOfWeek(now)
  const daysSoFar = Math.max(1, Math.round((now - weekStart) / DAY)) // more days -> bigger demo totals
  const businesses = new Map()

  for (const d of donations) {
    if (!businesses.has(d.businessId)) {
      // demo: 8–28 portions per day for the days before today
      const perDay = 8 + pseudoRandom(`${d.businessId}-${weekStart}`) * 20
      businesses.set(d.businessId, {
        id: d.businessId,
        name: d.businessName,
        address: d.address,
        portions: Math.round(perDay * (daysSoFar - 1)),
      })
    }
    if (d.status === 'distributed' && d.distributedAt >= weekStart) {
      businesses.get(d.businessId).portions += d.portions // real
    }
  }

  return [...businesses.values()].sort((a, b) => b.portions - a.portions).slice(0, limit)
}
