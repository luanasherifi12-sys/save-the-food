import { Link } from 'react-router-dom'
import UrgentBadge from './UrgentBadge.jsx'
import { ALLERGENS, FOOD_TYPES, STORAGE_TYPES } from '../lib/constants.js'
import { formatClock, formatCountdown, isUrgent } from '../lib/time.js'

// `now` comes from the parent page, so all cards share one clock.
function DonationCard({ donation, now }) {
  const foodType = FOOD_TYPES[donation.foodType]
  const storage = STORAGE_TYPES[donation.storage]
  const hasNoAllergens = donation.allergens.includes('none')
  const urgent = isUrgent(donation, now)

  return (
    <Link
      to={`/donations/${donation.id}`}
      className={`block rounded-3xl bg-white p-4 shadow-sm transition active:scale-[0.98] ${
        urgent ? 'ring-2 ring-urgent-500' : 'ring-1 ring-brand-100'
      }`}
    >
      {urgent && (
        <div className="mb-3">
          <UrgentBadge />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-cream-50 text-3xl">
          {foodType.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-brand-900">
            {foodType.label} · {donation.portions} porcione
          </p>
          <p className="truncate text-sm text-ink/70">
            {donation.businessName} · {donation.address}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-900">
          {storage.icon} {storage.label}
        </span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-900">
          ≈ {donation.kg.toLocaleString('sq-AL')} kg
        </span>
        {hasNoAllergens ? (
          <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-900">✓ Pa alergjenë</span>
        ) : (
          donation.allergens.map((allergen) => (
            <span key={allergen} className="rounded-full bg-cream-100 px-3 py-1 text-crust-700">
              ⚠ {ALLERGENS[allergen]}
            </span>
          ))
        )}
      </div>

      <div
        className={`mt-3 flex items-baseline justify-between rounded-2xl px-3 py-2 ${
          urgent ? 'bg-urgent-50 text-urgent-700' : 'bg-surface text-brand-700'
        }`}
      >
        <span className="text-sm font-medium">⏰ Mbeten</span>
        {/* tabular-nums: all digits same width, so the countdown does not "jump" */}
        <span className="font-display text-xl font-bold tabular-nums">
          {formatCountdown(donation.pickupDeadline - now)}
        </span>
        <span className="text-sm font-medium">deri {formatClock(donation.pickupDeadline)}</span>
      </div>
    </Link>
  )
}

export default DonationCard
