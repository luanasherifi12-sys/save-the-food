import { useState } from 'react'
import DonationCard from '../components/DonationCard.jsx'
import DonationMap from '../components/DonationMap.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { resetDonations } from '../lib/donationsStore.js'
import { isAvailable, isUrgent } from '../lib/time.js'

const VIEWS = [
  { value: 'map', label: 'Hartë', icon: '🗺️' },
  { value: 'list', label: 'Listë', icon: '📋' },
]

function BrowsePage() {
  const donations = useDonations()
  const now = useNow() // ticks every second -> countdowns update, expired food disappears
  const [view, setView] = useState('map')
  const [selectedId, setSelectedId] = useState(null)

  // Only food that can still be reserved, the most urgent first.
  const available = donations
    .filter((d) => isAvailable(d, now))
    .sort((a, b) => a.pickupDeadline - b.pickupDeadline)
  const urgentCount = available.filter((d) => isUrgent(d, now)).length

  // Derived, not stored: if the selected food expires, this simply becomes null.
  const selected = available.find((d) => d.id === selectedId) ?? null

  return (
    <section className="p-4">
      <h1 className="font-display text-2xl font-bold text-brand-900">Ushqimi afër teje</h1>
      <p className="mt-1 text-ink/70">
        {available.length} donacione në dispozicion
        {urgentCount > 0 && (
          <span className="font-semibold text-urgent-700"> · {urgentCount} urgjente</span>
        )}
      </p>

      {/* Map / list switch */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-brand-100">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            aria-pressed={view === v.value}
            onClick={() => setView(v.value)}
            className={`h-11 rounded-xl font-semibold transition ${
              view === v.value ? 'bg-brand-700 text-white' : 'text-ink/60'
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        // relative: the floating panel below is positioned inside this box
        <div className="relative mt-4">
          {/* Fills the screen between the top part and the bottom navigation (~18.5rem) */}
          <DonationMap
            donations={available}
            now={now}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-[calc(100svh-18.5rem)] min-h-80"
          />

          {/* Floating panel over the bottom of the map. z-[1000]: above the Leaflet layers */}
          <div className="absolute inset-x-3 bottom-3 z-[1000]">
            {selected ? (
              <div className="relative rounded-3xl shadow-2xl">
                <DonationCard donation={selected} now={now} />
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
              <p className="mx-auto w-fit rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-ink/70 shadow-md">
                👆 Prek një pin për të parë detajet
              </p>
            )}
          </div>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {available.map((donation) => (
            <li key={donation.id}>
              <DonationCard donation={donation} now={now} />
            </li>
          ))}
        </ul>
      )}

      {available.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-6 text-center text-ink/70">
          Për momentin nuk ka ushqim në dispozicion.
        </p>
      )}

      <button
        type="button"
        onClick={resetDonations}
        className="mt-8 w-full py-3 text-sm font-medium text-ink/50 underline"
      >
        ↺ Rivendos të dhënat shembull
      </button>
    </section>
  )
}

export default BrowsePage
