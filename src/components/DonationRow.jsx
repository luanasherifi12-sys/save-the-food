import { Link } from 'react-router-dom'
import FoodIcon from './FoodIcon.jsx'
import StatusBadge from './StatusBadge.jsx'
import { FOOD_TYPES } from '../lib/constants.js'

// Compact row linking to the donation. `children` is the extra line under the title,
// e.g. a countdown or "12 persona" – whatever is written between <DonationRow> and </DonationRow>.
// `subtitle` defaults to the business name.
function DonationRow({ donation, subtitle = donation.businessName, muted = false, children }) {
  const foodType = FOOD_TYPES[donation.foodType]
  return (
    <Link
      to={`/donations/${donation.id}`}
      className={`flex h-full items-center gap-3 rounded-3xl bg-white p-4 ring-1 ring-brand-100 active:scale-[0.98] ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <FoodIcon foodType={donation.foodType} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-brand-900">
            {foodType.label} · {donation.portions} porc.
          </p>
          <StatusBadge status={donation.status} />
        </div>
        <p className="truncate text-sm text-ink/70">{subtitle}</p>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </Link>
  )
}

export default DonationRow
