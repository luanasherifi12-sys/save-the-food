import { Check, MapPin, TriangleAlert } from 'lucide-react'
import { ALLERGENS, STORAGE_TYPES } from '../lib/constants.js'
import { formatDistance } from '../lib/distance.js'

const TAG = 'inline-flex items-center gap-1 rounded-full px-3 py-1'
const TAG_ICON = 'size-3.5 shrink-0'

// Small info chips: distance (optional), storage, kg and allergens.
function DonationTags({ donation, distanceKm }) {
  const storage = STORAGE_TYPES[donation.storage]
  const hasNoAllergens = donation.allergens.includes('none')

  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      {distanceKm !== undefined && (
        <span className={`${TAG} bg-brand-700 text-white`}>
          <MapPin className={TAG_ICON} /> {formatDistance(distanceKm)}
        </span>
      )}
      <span className={`${TAG} bg-brand-50 text-brand-900`}>
        <storage.Icon className={TAG_ICON} /> {storage.label}
      </span>
      <span className={`${TAG} bg-brand-50 text-brand-900`}>≈ {donation.kg.toLocaleString('sq-AL')} kg</span>
      {hasNoAllergens ? (
        <span className={`${TAG} bg-brand-100 text-brand-900`}>
          <Check className={TAG_ICON} /> Pa alergjenë
        </span>
      ) : (
        donation.allergens.map((allergen) => (
          <span key={allergen} className={`${TAG} bg-cream-100 text-crust-700`}>
            <TriangleAlert className={TAG_ICON} /> {ALLERGENS[allergen]}
          </span>
        ))
      )}
    </div>
  )
}

export default DonationTags
