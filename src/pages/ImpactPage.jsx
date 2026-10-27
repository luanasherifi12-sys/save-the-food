import { CircleCheckBig, Leaf, Scale, Truck, Users, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import DonationRow from '../components/DonationRow.jsx'
import InlineIcon from '../components/InlineIcon.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import StatTile from '../components/StatTile.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { CO2E_PER_KG_FOOD, DEMO_BUSINESS, FOOD_TYPES } from '../lib/constants.js'
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

function ImpactPage() {
  const { role } = useOutletContext()
  const donations = useDonations()
  const [scope, setScope] = useState('mine')

  const selected = scope === 'mine' ? donations.filter((d) => isMine(d, role)) : donations
  const impact = calculateImpact(selected)
  const maxPortions = Math.max(...impact.byFoodType.map((item) => item.portions), 1)

  return (
    // Computer: a 2-column grid; full-width rows use lg:col-span-2
    <section className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:p-6">
      <h1 className="font-display text-2xl font-semibold text-brand-900 lg:col-span-2">Ndikimi ynë</h1>

      <SegmentedControl
        options={SCOPES}
        value={scope}
        onChange={setScope}
        className="md:max-w-md lg:col-span-2"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:col-span-2 lg:gap-4">
        <StatTile
          Icon={UtensilsCrossed}
          value={formatNumber(impact.portions)}
          label={plural(impact.portions, 'porcion i shpëtuar', 'porcione të shpëtuara')}
        />
        <StatTile Icon={Scale} value={`${formatNumber(impact.kg)} kg`} label="ushqim i rikuperuar" />
        <StatTile
          Icon={CircleCheckBig}
          value={formatNumber(impact.completedCount)}
          label={plural(impact.completedCount, 'donacion i përfunduar', 'donacione të përfunduara')}
        />
        <StatTile
          Icon={Users}
          value={formatNumber(impact.people)}
          label={plural(impact.people, 'person i ndihmuar', 'persona të ndihmuar')}
        />
      </div>

      {/* The environmental side of the same kilograms. Full width so the 4 tiles above stay a clean grid. */}
      {impact.co2Kg > 0 && (
        <div className="flex items-center gap-4 rounded-3xl bg-header p-4 text-white lg:col-span-2">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-header-soft">
            <Leaf className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold tabular-nums">
              ≈ {formatNumber(impact.co2Kg)} kg CO₂
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
          Ende asnjë donacion i shpërndarë. Numrat rriten sapo shënohet shpërndarja e parë.
        </p>
      ) : (
        <>
          <div className="rounded-3xl bg-card p-4 ring-1 ring-brand-100">
            <h2 className="text-sm font-semibold tracking-wide text-ink/60 uppercase">
              Porcione sipas llojit
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
