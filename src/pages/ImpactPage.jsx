import { CircleCheckBig, Leaf, Scale, TrendingDown, TrendingUp, Truck, Users, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import DonationRow from '../components/DonationRow.jsx'
import InlineIcon from '../components/InlineIcon.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import StatTile from '../components/StatTile.jsx'
import TrendChart from '../components/TrendChart.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { CO2E_PER_KG_FOOD, DEMO_BUSINESS, FOOD_TYPES } from '../lib/constants.js'
import { HISTORY_DAYS, createDailyHistory, startOfDay, sumDays } from '../lib/history.js'
import { calculateImpact } from '../lib/impact.js'
import { formatClock } from '../lib/time.js'

const SCOPES = [
  { value: 'mine', label: 'Të miat' },
  { value: 'city', label: 'Gjithë Prishtina' },
]

// Which donations are "mine" depends on the role (no login yet).
function isMine(donation, role) {
  if (role === 'business') return donation.businessId === DEMO_BUSINESS.id
  return donation.reservedBy === role
}

function formatNumber(number) {
  return number.toLocaleString('sq-AL') // 1234.5 -> "1.234,5"
}

// Albanian singular/plural: 1 porcion i shpëtuar, 5 porcione të shpëtuara
function plural(count, one, many) {
  return count === 1 ? one : many
}

// Portions of a list of days, added up
function sumPortions(days) {
  return days.reduce((sum, day) => sum + day.portions, 0)
}

function ImpactPage() {
  const { role } = useOutletContext()
  const donations = useDonations()
  const now = useNow(60 * 1000) // only needed to know which day "today" is
  const [scope, setScope] = useState('mine')
  const isCity = scope === 'city'

  const selected = isCity ? donations : donations.filter((d) => isMine(d, role))
  const impact = calculateImpact(selected) // today, live
  const maxPortions = Math.max(...impact.byFoodType.map((item) => item.portions), 1)

  // City: the last 14 days (demo history + today live). Mine: today only.
  const history = isCity ? createDailyHistory(now) : []
  const totals = sumDays([...history, { ...impact, donations: impact.completedCount }])
  const co2Kg = Math.round(totals.kg * CO2E_PER_KG_FOOD)

  const chartDays = [...history, { date: startOfDay(now), portions: impact.portions }]
  const thisWeek = sumPortions(chartDays.slice(-7))
  const lastWeek = sumPortions(chartDays.slice(-14, -7))
  const weekChange = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0

  return (
    // Computer: a 2-column grid; full-width rows use lg:col-span-2
    <section className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:p-6">
      <h1 className="font-display text-2xl font-semibold text-brand-900 lg:col-span-2">Ndikimi ynë</h1>

      <div className="flex flex-col gap-2 lg:col-span-2">
        <SegmentedControl options={SCOPES} value={scope} onChange={setScope} className="md:max-w-md" />
        <p className="text-sm text-ink/60">
          {isCity
            ? `${HISTORY_DAYS} ditët e fundit, përfshirë sot · ditët para sotit janë të dhëna demo`
            : 'Sot, nga donacionet e tua'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:col-span-2 lg:gap-4">
        <StatTile
          Icon={UtensilsCrossed}
          value={<AnimatedNumber value={totals.portions} />}
          label={plural(totals.portions, 'porcion i shpëtuar', 'porcione të shpëtuara')}
        />
        <StatTile
          Icon={Scale}
          value={
            <>
              <AnimatedNumber value={totals.kg} decimals={1} /> kg
            </>
          }
          label="ushqim i rikuperuar"
        />
        <StatTile
          Icon={CircleCheckBig}
          value={<AnimatedNumber value={totals.donations} />}
          label={plural(totals.donations, 'donacion i përfunduar', 'donacione të përfunduara')}
        />
        <StatTile
          Icon={Users}
          value={<AnimatedNumber value={totals.people} />}
          label={plural(totals.people, 'person i ndihmuar', 'persona të ndihmuar')}
        />
      </div>

      {/* City: portions per day, with this week compared to last week */}
      {isCity && (
        <div className="rounded-3xl bg-card p-4 ring-1 ring-brand-100 lg:col-span-2 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-brand-900">Porcione të shpëtuara çdo ditë</h2>
              <p className="text-sm text-ink/60">
                Këtë javë {formatNumber(thisWeek)} · java e kaluar {formatNumber(lastWeek)}
              </p>
            </div>
            {weekChange !== 0 && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold ring-1 ring-inset ${
                  weekChange > 0 ? 'text-brand-700 ring-brand-700/30' : 'text-urgent-700 ring-urgent-500/40'
                }`}
              >
                {weekChange > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {weekChange > 0 ? '+' : ''}
                {weekChange}% nga java e kaluar
              </span>
            )}
          </div>
          <div className="mt-4">
            <TrendChart days={chartDays} />
          </div>
        </div>
      )}

      {/* The environmental side of the same kilograms. Full width so the 4 tiles above stay a clean grid. */}
      {co2Kg > 0 && (
        <div className="flex items-center gap-4 rounded-3xl bg-header p-4 text-white lg:col-span-2">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-header-soft">
            <Leaf className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold tabular-nums">
              ≈ <AnimatedNumber value={co2Kg} /> kg CO₂
            </p>
            <p className="text-sm text-header-soft">
              të shmangura, sepse ky ushqim nuk përfundoi si mbeturinë
            </p>
          </div>
        </div>
      )}

      {impact.inProgressPortions > 0 && (
        <p className="rounded-2xl bg-brand-50 p-3 text-sm text-brand-900 lg:col-span-2">
          <InlineIcon Icon={Truck} />
          Edhe <strong>{formatNumber(impact.inProgressPortions)} porcione</strong> janë marrë dhe po
          shpërndahen.
        </p>
      )}

      {impact.completedCount === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-center text-ink/70 lg:col-span-2">
          Sot ende asnjë donacion i shpërndarë. Numrat rriten sapo shënohet shpërndarja e parë.
        </p>
      ) : (
        <>
          <div className="rounded-3xl bg-card p-4 ring-1 ring-brand-100">
            <h2 className="text-sm font-semibold tracking-wide text-ink/60 uppercase">
              Sot sipas llojit
            </h2>
            {/* A simple bar list: one color, value written next to each bar */}
            <ul className="mt-3 flex flex-col gap-3">
              {impact.byFoodType.map((item) => {
                const foodType = FOOD_TYPES[item.foodType]
                return (
                  <li key={item.foodType}>
                    <div className="flex justify-between text-sm">
                      <span>
                        <InlineIcon Icon={foodType.Icon} className="text-crust-700" />
                        {foodType.label}
                      </span>
                      <span className="font-semibold tabular-nums">{formatNumber(item.portions)}</span>
                    </div>
                    <div className="mt-1 h-2.5 rounded-full bg-brand-50">
                      <div
                        className="h-full rounded-full bg-brand-700"
                        style={{ width: `${(item.portions / maxPortions) * 100}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-ink/60 uppercase">Të fundit</h2>
            <ul className="flex flex-col gap-2">
              {impact.recent.map((donation) => (
                <li key={donation.id}>
                  <DonationRow donation={donation}>
                    <p className="text-sm text-ink/70">
                      <InlineIcon Icon={Users} />
                      {donation.peopleHelped} persona · {formatClock(donation.distributedAt)}
                    </p>
                  </DonationRow>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <p className="text-center text-xs text-ink/50 lg:col-span-2">
        Llogaritet nga donacionet me status “Shpërndarë”. Personat i shënon organizata ose vullnetari.
        CO₂ është vlerësim: ≈ {formatNumber(CO2E_PER_KG_FOOD)} kg CO₂e për çdo kg ushqim të humbur (FAO, 2013).
      </p>
    </section>
  )
}

export default ImpactPage
