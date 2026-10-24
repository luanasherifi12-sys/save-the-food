import { ALLERGENS, STORAGE_TYPES } from '../lib/constants.js'
import { formatDistance } from '../lib/distance.js'

// Small info chips: distance (optional), storage, kg and allergens.
function DonationTags({ donation, distanceKm }) {
  const storage = STORAGE_TYPES[donation.storage]
  const hasNoAllergens = donation.allergens.includes('none')

  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      {distanceKm !== undefined && (
        <span className="rounded-full bg-brand-700 px-3 py-1 text-white">
          📍 {formatDistance(distanceKm)}
        </span>
      )}
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
  )
}

export default DonationTags
