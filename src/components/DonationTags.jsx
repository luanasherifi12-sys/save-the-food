import { Check, MapPin, TriangleAlert } from 'lucide-react'
import { ALLERGENS, STORAGE_TYPES } from '../lib/constants.js'
import { formatDistance } from '../lib/distance.js'

const TAG = 'inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-inset'
const TAG_ICON = 'size-3.5 shrink-0'

// Small info chips: distance (optional), storage, kg and allergens.
function DonationTags({ donation, distanceKm }) {
  const storage = STORAGE_TYPES[donation.storage]
  const hasNoAllergens = donation.allergens.includes('none')

  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      {distanceKm !== undefined && (
        <span className={`${TAG} font-semibold text-brand-700 ring-brand-700/30`}>
          <MapPin className={TAG_ICON} /> {formatDistance(distanceKm)}
        </span>
      )}
      <span className={`${TAG} text-ink/80 ring-ink/15`}>
        <storage.Icon className={TAG_ICON} /> {storage.label}
      </span>
      <span className={`${TAG} text-ink/80 ring-ink/15`}>≈ {donation.kg.toLocaleString('sq-AL')} kg</span>
      {hasNoAllergens ? (
        <span className={`${TAG} text-brand-700 ring-brand-700/30`}>
          <Check className={TAG_ICON} /> Pa alergjenë
        </span>
      ) : (
        donation.allergens.map((allergen) => (
          <span key={allergen} className={`${TAG} text-crust-700 ring-crust-500/40`}>
            <TriangleAlert className={TAG_ICON} /> {ALLERGENS[allergen]}
          </span>
        ))
      )}
    </div>
  )
}

export default DonationTags
