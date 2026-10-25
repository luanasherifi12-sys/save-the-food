import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import DonationTags from './DonationTags.jsx'
import FoodIcon from './FoodIcon.jsx'
import UrgentBadge from './UrgentBadge.jsx'
import { FOOD_TYPES } from '../lib/constants.js'
import { formatClock, formatCountdown, isUrgent } from '../lib/time.js'

// `now` comes from the parent page, so all cards share one clock.
// `distanceKm` is optional: the chip is shown only when it is given.
// `highlighted` marks the card whose pin is selected on the map (computer view);
// `onPointerEnter` lets the page highlight the pin when the mouse is over the card.
function DonationCard({ donation, now, distanceKm, highlighted = false, onPointerEnter }) {
  const foodType = FOOD_TYPES[donation.foodType]
  const urgent = isUrgent(donation, now)

  let ring = urgent ? 'ring-2 ring-urgent-500' : 'ring-1 ring-brand-100'
  if (highlighted) ring = 'ring-4 ring-brand-500 shadow-lg'

  return (
    <Link
      to={`/donations/${donation.id}`}
      onPointerEnter={onPointerEnter}
      onFocus={onPointerEnter} // keyboard users get the same highlight
      // md: flex column, so the countdown sits at the bottom when cards in a grid row have different heights
      className={`block h-full rounded-3xl bg-white p-4 shadow-sm transition active:scale-[0.98] md:flex md:flex-col ${ring}`}
    >
      {urgent && (
        <div className="mb-3">
          <UrgentBadge />
        </div>
      )}

      <div className="flex items-center gap-3">
        <FoodIcon foodType={donation.foodType} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-brand-900">
            {foodType.label} · {donation.portions} porcione
          </p>
          <p className="truncate text-sm text-ink/70">
            {donation.businessName} · {donation.address}
          </p>
        </div>
      </div>

      <div className="mt-3 md:mb-3">
        <DonationTags donation={donation} distanceKm={distanceKm} />
      </div>

      <div
        className={`mt-3 flex items-baseline justify-between rounded-2xl px-3 py-2 md:mt-auto ${
          urgent ? 'bg-urgent-50 text-urgent-700' : 'bg-surface text-brand-700'
        }`}
      >
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Clock className="size-4" /> Mbeten
        </span>
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
