import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

// The same green drop pin as on the main map, without an icon inside
const PIN = L.divIcon({
  html: '<div class="size-9 -rotate-45 rounded-[50%_50%_50%_0] border-[3px] border-white bg-brand-700 shadow-lg"></div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18 + Math.round(18 * Math.SQRT2)],
})

// Tap the map -> the pin moves there
function ClickToMove({ onChange }) {
  useMapEvents({ click: (event) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }) })
  return null
}

// When the value changes from outside (e.g. "Përdor vendndodhjen time"), move the map along.
function FollowValue({ value }) {
  const map = useMap()
  useEffect(() => {
    map.panTo([value.lat, value.lng])
  }, [map, value.lat, value.lng])
  return null
}

// Choose a place: tap the map or drag the pin. value/onChange: { lat, lng }
function LocationPicker({ value, onChange, className = '' }) {
  return (
    <MapContainer
      center={[value.lat, value.lng]}
      zoom={15}
      scrollWheelZoom={false}
      className={`w-full rounded-2xl ring-1 ring-brand-100 ${className}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToMove onChange={onChange} />
      <FollowValue value={value} />
      <Marker
        position={[value.lat, value.lng]}
        icon={PIN}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const { lat, lng } = event.target.getLatLng()
            onChange({ lat, lng })
          },
        }}
      />
    </MapContainer>
  )
}

export default LocationPicker
