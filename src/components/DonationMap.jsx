import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { FOOD_TYPES, PRISHTINA_CENTER } from '../lib/constants.js'
import { isUrgent } from '../lib/time.js'

// Text that goes into an HTML string must be escaped, otherwise a business name like
// "<img onerror=...>" would run as code (XSS). React does this for us in JSX, but not here.
function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// "Bukë, 20 porcione, Furra Dardania, urgjent" – read by screen readers.
function getPinLabel(donation, urgent) {
  const parts = [FOOD_TYPES[donation.foodType].label, `${donation.portions} porcione`, donation.businessName]
  if (urgent) parts.push('urgjent')
  return parts.join(', ')
}

// Leaflet pins are plain HTML strings. The page re-renders every second (countdown),
// so we cache each icon and reuse the same object instead of rebuilding the pin each time.
const iconCache = new Map()

function getPinIcon(donation, urgent, selected) {
  const label = getPinLabel(donation, urgent)
  const key = `${donation.foodType}|${label}|${selected}`
  if (!iconCache.has(key)) {
    const color = urgent ? 'bg-urgent-500' : 'bg-brand-700'
    const size = selected ? 'size-12 ring-4 ring-brand-900/30' : 'size-10'
    // A square with one sharp corner, turned 45° -> a drop shape pointing down.
    // The emoji inside is turned back so it stays upright.
    // Leaflet gives the pin role="button"; the sr-only text becomes its accessible name.
    const html = `
      <div class="${size} ${color} flex -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] border-2 border-white shadow-lg">
        <span class="rotate-45 text-xl" aria-hidden="true">${FOOD_TYPES[donation.foodType].icon}</span>
      </div>
      <span class="sr-only">${escapeHtml(label)}</span>`
    const side = selected ? 48 : 40
    iconCache.set(
      key,
      L.divIcon({
        html,
        className: '', // removes Leaflet's default white box around the icon
        iconSize: [side, side],
        // The tip sits below the center by half the diagonal (side / 2 × √2)
        iconAnchor: [side / 2, side / 2 + Math.round((side / 2) * Math.SQRT2)],
      }),
    )
  }
  return iconCache.get(key)
}

// When a pin is selected, move the map so the pin sits in the upper part,
// above the floating card that covers the bottom of the map.
function KeepSelectedVisible({ donations, selectedId }) {
  const map = useMap()
  const selected = donations.find((d) => d.id === selectedId)
  const lat = selected?.lat
  const lng = selected?.lng

  // Runs only when the selected position changes, not on every countdown tick.
  useEffect(() => {
    if (lat === undefined) return
    const zoom = map.getZoom()
    const pinPoint = map.project([lat, lng], zoom) // map coordinates -> pixels
    const newCenter = pinPoint.add([0, map.getSize().y * 0.25]) // center 25% of the height below the pin
    map.panTo(map.unproject(newCenter, zoom))
  }, [map, lat, lng])

  return null
}

// Tapping an empty spot on the map closes the selected card (like Google Maps).
function MapBackgroundClick({ onClick }) {
  useMapEvents({ click: onClick })
  return null // renders nothing, only listens
}

function DonationMap({ donations, now, selectedId, onSelect, className = '' }) {
  return (
    <MapContainer
      center={[PRISHTINA_CENTER.lat, PRISHTINA_CENTER.lng]}
      zoom={13}
      className={`w-full rounded-3xl ring-1 ring-brand-100 ${className}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBackgroundClick onClick={() => onSelect(null)} />
      <KeepSelectedVisible donations={donations} selectedId={selectedId} />
      {donations.map((donation) => {
        const urgent = isUrgent(donation, now)
        const selected = donation.id === selectedId
        return (
          <Marker
            key={donation.id}
            position={[donation.lat, donation.lng]}
            icon={getPinIcon(donation, urgent, selected)}
            zIndexOffset={selected ? 1000 : urgent ? 500 : 0} // selected/urgent pins on top
            eventHandlers={{ click: () => onSelect(donation.id) }}
          />
        )
      })}
    </MapContainer>
  )
}

export default DonationMap
