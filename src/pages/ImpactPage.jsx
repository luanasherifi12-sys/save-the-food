import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import DonationRow from '../components/DonationRow.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import StatTile from '../components/StatTile.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { DEMO_BUSINESS, FOOD_TYPES } from '../lib/constants.js'
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
    <section className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-2xl font-bold text-brand-900">Ndikimi ynë</h1>

      <SegmentedControl options={SCOPES} value={scope} onChange={setScope} />

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon="🍽️"
          value={formatNumber(impact.portions)}
          label={plural(impact.portions, 'porcion i shpëtuar', 'porcione të shpëtuara')}
        />
        <StatTile icon="⚖️" value={`${formatNumber(impact.kg)} kg`} label="ushqim i rikuperuar" />
        <StatTile
          icon="✅"
          value={formatNumber(impact.completedCount)}
          label={plural(impact.completedCount, 'donacion i përfunduar', 'donacione të përfunduara')}
        />
        <StatTile
          icon="👥"
          value={formatNumber(impact.people)}
          label={plural(impact.people, 'person i ndihmuar', 'persona të ndihmuar')}
        />
      </div>

      {impact.inProgressPortions > 0 && (
        <p className="rounded-2xl bg-brand-50 p-3 text-sm text-brand-900">
          🚚 Edhe <strong>{formatNumber(impact.inProgressPortions)} porcione</strong> janë marrë dhe po
          shpërndahen.
        </p>
      )}

      {impact.completedCount === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-ink/70">
          Ende asnjë donacion i shpërndarë. Numrat rriten sapo shënohet shpërndarja e parë.
        </p>
      ) : (
        <>
          <div className="rounded-3xl bg-white p-4 ring-1 ring-brand-100">
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
                        {foodType.icon} {foodType.label}
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
                      👥 {donation.peopleHelped} persona · {formatClock(donation.distributedAt)}
                    </p>
                  </DonationRow>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <p className="text-center text-xs text-ink/50">
        Llogaritet nga donacionet me status “Shpërndarë”. Personat i shënon organizata ose vullnetari.
      </p>
    </section>
  )
}

export default ImpactPage
