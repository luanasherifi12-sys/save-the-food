import { useState } from 'react'
import DonationCard from '../components/DonationCard.jsx'
import DonationMap from '../components/DonationMap.jsx'
import FilterBar, { DEFAULT_FILTERS } from '../components/FilterBar.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { useUserLocation } from '../hooks/useUserLocation.js'
import { PRISHTINA_CENTER } from '../lib/constants.js'
import { distanceKm } from '../lib/distance.js'
import { resetDonations } from '../lib/donationsStore.js'
import { isAvailable, isUrgent } from '../lib/time.js'

const VIEWS = [
  { value: 'map', label: 'Hartë', icon: '🗺️' },
  { value: 'list', label: 'Listë', icon: '📋' },
]

function BrowsePage() {
  const donations = useDonations()
  const now = useNow() // ticks every second -> countdowns update, expired food disappears
  const location = useUserLocation()
  const [view, setView] = useState('map')
  const [selectedId, setSelectedId] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Distances are measured from the user, or from the center of Prishtina if we don't know where they are.
  const origin = location.position ?? PRISHTINA_CENTER
  const distanceTo = (donation) => distanceKm(origin, donation)

  function matchesFilters(donation) {
    if (filters.foodType !== 'all' && donation.foodType !== filters.foodType) return false
    if (filters.maxKm !== 'all' && distanceTo(donation) > filters.maxKm) return false
    if (filters.urgency === 'urgent' && !isUrgent(donation, now)) return false
    return true
  }

  // Only food that can still be reserved and matches the filters, the most urgent first.
  const available = donations.filter((d) => isAvailable(d, now))
  const visible = available
    .filter(matchesFilters)
    .sort((a, b) => a.pickupDeadline - b.pickupDeadline)
  const urgentCount = visible.filter((d) => isUrgent(d, now)).length
  const isFiltered = visible.length !== available.length

  // Derived, not stored: if the selected food expires or is filtered out, this simply becomes null.
  const selected = visible.find((d) => d.id === selectedId) ?? null

  return (
    <section className="flex flex-col gap-3 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Ushqimi afër teje</h1>
        <p className="mt-1 text-ink/70">
          {visible.length} {visible.length === 1 ? 'donacion' : 'donacione'} në dispozicion
          {isFiltered && ` (nga ${available.length})`}
          {urgentCount > 0 && (
            <span className="font-semibold text-urgent-700">
              {' '}
              · {urgentCount} {urgentCount === 1 ? 'urgjent' : 'urgjente'}
            </span>
          )}
        </p>
      </div>

      <LocationNotice location={location} />

      {/* Map / list switch */}
      <SegmentedControl options={VIEWS} value={view} onChange={setView} />

      <FilterBar filters={filters} onChange={setFilters} />

      {view === 'map' ? (
        // relative: the floating panel below is positioned inside this box
        <div className="relative">
          {/* Fills the screen between the top part and the bottom navigation */}
          <DonationMap
            donations={visible}
            now={now}
            selectedId={selectedId}
            onSelect={setSelectedId}
            userPosition={location.position}
            className="h-[calc(100svh-23rem)] min-h-80"
          />

          {/* Floating panel over the bottom of the map. z-[1000]: above the Leaflet layers */}
          <div className="absolute inset-x-3 bottom-3 z-[1000]">
            {selected ? (
              <div className="relative rounded-3xl shadow-2xl">
                <DonationCard donation={selected} now={now} distanceKm={distanceTo(selected)} />
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Mbyll"
                  className="absolute -top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white text-lg font-bold text-ink shadow-md ring-1 ring-brand-100"
                >
                  ✕
                </button>
              </div>
            ) : (
              visible.length > 0 && (
                <p className="mx-auto w-fit rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-ink/70 shadow-md">
                  👆 Prek një pin për të parë detajet
                </p>
              )
            )}
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((donation) => (
            <li key={donation.id}>
              <DonationCard donation={donation} now={now} distanceKm={distanceTo(donation)} />
            </li>
          ))}
        </ul>
      )}

      {visible.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-center text-ink/70">
          {isFiltered ? (
            <>
              <p>Asnjë donacion me këta filtra.</p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-2 font-semibold text-brand-700 underline"
              >
                Pastro filtrat
              </button>
            </>
          ) : (
            <p>Për momentin nuk ka ushqim në dispozicion.</p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={resetDonations}
        className="mt-5 w-full py-3 text-sm font-medium text-ink/50 underline"
      >
        ↺ Rivendos të dhënat shembull
      </button>
    </section>
  )
}

// One line that says where distances are measured from, with a button to use the real location.
function LocationNotice({ location }) {
  if (location.status === 'granted') {
    return <p className="text-sm font-medium text-brand-700">📍 Distancat nga vendndodhja jote</p>
  }

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-ink/70">
        📍 Distancat nga qendra e Prishtinës
        {location.status === 'error' && (
          <span className="block text-urgent-700">Vendndodhja nuk u mor.</span>
        )}
      </span>
      <button
        type="button"
        onClick={location.requestLocation}
        disabled={location.status === 'loading'}
        className="shrink-0 rounded-full bg-white px-3 py-2 font-semibold text-brand-700 ring-1 ring-brand-100 disabled:opacity-60"
      >
        {location.status === 'loading' ? 'Duke kërkuar…' : 'Përdor vendndodhjen time'}
      </button>
    </div>
  )
}

export default BrowsePage
