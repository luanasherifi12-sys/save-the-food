import { lazy, Suspense } from 'react'

// The map (Leaflet) is the biggest part of the app. lazy() downloads it only when a map is
// actually shown, so the first page opens faster – especially on phones, where the landing page has no map.
const DonationMap = lazy(() => import('./DonationMap.jsx'))

// Same props as DonationMap. While the map code downloads, a calm placeholder of the same size is shown.
function LazyDonationMap(props) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="Harta po ngarkohet"
          className={`w-full animate-pulse rounded-3xl bg-brand-50 ring-1 ring-brand-100 ${props.className ?? ''}`}
        />
      }
    >
      <DonationMap {...props} />
    </Suspense>
  )
}

export default LazyDonationMap
