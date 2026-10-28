import { List, MapIcon, MapPin, Pointer, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import DonationCard from '../components/DonationCard.jsx'
import DonationMap from '../components/LazyDonationMap.jsx' // loads the map code only when needed
import FilterBar, { DEFAULT_FILTERS } from '../components/FilterBar.jsx'
import InlineIcon from '../components/InlineIcon.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery.js'
import { useNow } from '../hooks/useNow.js'
import { useUserLocation } from '../hooks/useUserLocation.js'
import { PRISHTINA_CENTER } from '../lib/constants.js'
import { distanceKm } from '../lib/distance.js'
import { resetDonations } from '../lib/donationsStore.js'
import { showToast } from '../lib/toast.js'
import { isAvailable, isUrgent } from '../lib/time.js'

const VIEWS = [
  { value: 'map', label: 'Hartë', Icon: MapIcon },
  { value: 'list', label: 'Listë', Icon: List },
]

function BrowsePage() {
  const donations = useDonations()
  const now = useNow() // ticks every second -> countdowns update, expired food disappears
  const location = useUserLocation()
  const [view, setView] = useState('map')
  const [selectedId, setSelectedId] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const listRef = useRef(null) // the <ul> of cards, to scroll a card into view
  const scrollToCardRef = useRef(false) // true right after a pin click

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

  // Computer: map and list side by side. Phone/tablet: one of them, chosen with the switch.
  const showMap = isDesktop || view === 'map'
  const showList = isDesktop || view === 'list'

  // A pin was clicked on the computer -> scroll its card into view in the list.
  // (Not when the mouse is over a card: that card is already visible.)
  function selectFromMap(id) {
    scrollToCardRef.current = id !== null
    setSelectedId(id)
  }

  useEffect(() => {
    if (!isDesktop || !selectedId || !scrollToCardRef.current) return
    scrollToCardRef.current = false
    listRef.current
      ?.querySelector(`[data-id="${selectedId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId, isDesktop])

  return (
    // lg: a grid with the map on the left and the list (26rem) on the right
    <section className="flex flex-col gap-3 p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-x-6 lg:p-6">
      <div className="lg:col-span-2">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Ushqimi afër teje</h1>
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

      <LocationNotice location={location} className="lg:col-span-2" />

      {/* Map / list switch – not needed on the computer, where both are shown */}
      <SegmentedControl options={VIEWS} value={view} onChange={setView} className="lg:hidden" />

      <FilterBar filters={filters} onChange={setFilters} className="lg:col-span-2" />

      {showMap && (
        // relative: the floating panel below is positioned inside this box.
        // Computer: the map stays in place (sticky) while the list scrolls.
        <div className="relative lg:sticky lg:top-4">
          {/* Fills the screen between the top part and the bottom navigation */}
          <DonationMap
            donations={visible}
            now={now}
            selectedId={selectedId}
            onSelect={selectFromMap}
            userPosition={location.position}
            panelCoversBottom={!isDesktop}
            className="h-[calc(100svh-23rem)] min-h-80 lg:h-[calc(100svh-6rem)]"
          />

          {/* Floating panel over the bottom of the map (phone/tablet; the computer has the list).
              z-[1000]: above the Leaflet layers */}
          {!isDesktop && (
            <div className="absolute inset-x-3 bottom-3 z-[1000] md:right-auto md:w-96">
              {selected ? (
                <div className="relative rounded-3xl shadow-2xl">
                  <DonationCard donation={selected} now={now} distanceKm={distanceTo(selected)} />
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Mbyll"
                    className="absolute -top-3 right-3 flex size-10 items-center justify-center rounded-full bg-card text-lg font-bold text-ink shadow-md ring-1 ring-brand-100"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ) : (
                visible.length > 0 && (
                  <p className="mx-auto w-fit rounded-full bg-card/95 px-4 py-2 text-sm font-medium text-ink/70 shadow-md">
                    <InlineIcon Icon={Pointer} />
                    Prek një pin për të parë detajet
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}

      {showList && (
        // tablet: 2 columns; computer: 1 column next to the map
        <ul ref={listRef} className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-1">
          {visible.map((donation) => (
            <li key={donation.id} data-id={donation.id}>
              <DonationCard
                donation={donation}
                now={now}
                distanceKm={distanceTo(donation)}
                highlighted={isDesktop && donation.id === selectedId}
                onPointerEnter={isDesktop ? () => setSelectedId(donation.id) : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      {visible.length === 0 && (
        <div className="rounded-2xl bg-card p-6 text-center text-ink/70 lg:col-start-2">
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
        onClick={() => {
          resetDonations()
          showToast('Të dhënat shembull u rivendosën.')
        }}
        className="mt-5 w-full py-3 text-sm font-medium text-ink/50 underline lg:col-span-2"
      >
        <InlineIcon Icon={RotateCcw} />Rivendos të dhënat shembull
      </button>
    </section>
  )
}

// One line that says where distances are measured from, with a button to use the real location.
function LocationNotice({ location, className = '' }) {
  if (location.status === 'granted') {
    return (
      <p className={`text-sm font-medium text-brand-700 ${className}`}>
        <InlineIcon Icon={MapPin} />
        Distancat nga vendndodhja jote
      </p>
    )
  }

  return (
    <div className={`flex items-center justify-between gap-2 text-sm md:justify-start md:gap-4 ${className}`}>
      <span className="text-ink/70">
        <InlineIcon Icon={MapPin} />Distancat nga qendra e Prishtinës
        {location.status === 'error' && (
          <span className="block text-urgent-700">Vendndodhja nuk u mor.</span>
        )}
      </span>
      <button
        type="button"
        onClick={location.requestLocation}
        disabled={location.status === 'loading'}
        className="min-h-11 shrink-0 rounded-full bg-card px-3 font-semibold text-brand-700 ring-1 ring-brand-100 disabled:opacity-60"
      >
        {location.status === 'loading' ? 'Duke kërkuar…' : 'Përdor vendndodhjen time'}
      </button>
    </div>
  )
}

export default BrowsePage
