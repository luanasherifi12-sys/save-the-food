import { ChevronRight, Hourglass } from 'lucide-react'
import { Link } from 'react-router-dom'
import FoodIcon from './FoodIcon.jsx'
import { FOOD_TYPES, ROLES } from '../lib/constants.js'
import { formatClock, formatCountdown, reservationEndsAt } from '../lib/time.js'

const TEN_MINUTES = 10 * 60 * 1000

// What the business shows the collector at pickup: the 4-digit code, big and easy to read.
// `showFood` adds a header with the food and a link to the details (used in the list).
function ReservedCodeCard({ donation, now, showFood = false }) {
  const msLeft = reservationEndsAt(donation) - now
  const collector = ROLES[donation.reservedBy]
  const foodType = FOOD_TYPES[donation.foodType]
  const digits = donation.pickupCode.split('') // "4821" -> ['4', '8', '2', '1']

  return (
    <div className="rounded-3xl bg-cream-50 p-4 ring-2 ring-crust-500">
      {showFood && (
        <Link to={`/donations/${donation.id}`} className="mb-3 flex min-h-11 items-center gap-3">
          <FoodIcon foodType={donation.foodType} size="sm" />
          <span className="flex-1 font-semibold text-brand-900">
            {foodType.label} · {donation.portions} porcione
          </span>
          <span className="flex items-center text-sm font-semibold text-brand-700">
            Detajet <ChevronRight className="size-4" />
          </span>
        </Link>
      )}

      <p className="text-center text-sm font-semibold tracking-wide text-crust-700 uppercase">
        Kodi i marrjes
      </p>
      {/* Read digit by digit by screen readers: "Kodi 4 8 2 1" */}
      <div role="img" aria-label={`Kodi ${digits.join(' ')}`} className="mt-2 flex justify-center gap-2">
        {digits.map((digit, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="flex h-20 w-16 items-center justify-center rounded-2xl bg-white font-display text-5xl font-bold text-brand-900 shadow-sm ring-1 ring-cream-100"
          >
            {digit}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center font-medium">
        Jepja këtë kod {collector.labelDative} kur të vijë.
      </p>

      <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-center">
        <p className={msLeft < TEN_MINUTES ? 'text-urgent-700' : 'text-crust-700'}>
          <Hourglass className="mr-1 inline size-4 align-[-2px]" />
          Rezervimi skadon për{' '}
          <strong className="font-display text-lg whitespace-nowrap tabular-nums">
            {formatCountdown(msLeft)}
          </strong>
        </p>
        <p className="flex items-center justify-center gap-1 text-xs text-ink/60">
          <collector.Icon className="size-3.5" />
          Rezervuar nga një {collector.label.toLowerCase()} në {formatClock(donation.reservedAt)}
        </p>
      </div>
    </div>
  )
}

export default ReservedCodeCard
