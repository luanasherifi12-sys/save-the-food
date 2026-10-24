import DonationCard from '../components/DonationCard.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { resetDonations } from '../lib/donationsStore.js'
import { isAvailable } from '../lib/time.js'

function BrowsePage() {
  const donations = useDonations()

  // Only food that can still be reserved, the most urgent first.
  // (In Step 4 "now" will update every second.)
  const now = Date.now()
  const available = donations
    .filter((d) => isAvailable(d, now))
    .sort((a, b) => a.pickupDeadline - b.pickupDeadline)

  return (
    <section className="p-4">
      <h1 className="font-display text-2xl font-bold text-brand-900">Ushqimi afër teje</h1>
      <p className="mt-1 text-ink/70">{available.length} donacione në dispozicion</p>

      <ul className="mt-4 flex flex-col gap-3">
        {available.map((donation) => (
          <li key={donation.id}>
            <DonationCard donation={donation} />
          </li>
        ))}
      </ul>

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
