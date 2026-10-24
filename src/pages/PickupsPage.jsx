import { Link, useOutletContext } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { FOOD_TYPES } from '../lib/constants.js'
import { formatClock, formatCountdown, releaseIfExpired, reservationEndsAt } from '../lib/time.js'

const TEN_MINUTES = 10 * 60 * 1000

// The collector's own reservations and pickups.
// Without login, "mine" means "reserved by my role" (organization or volunteer).
function PickupsPage() {
  const { role } = useOutletContext()
  const donations = useDonations()
  const now = useNow()

  const mine = donations.map((d) => releaseIfExpired(d, now)).filter((d) => d.reservedBy === role)
  const active = mine
    .filter((d) => d.status === 'reserved' || d.status === 'picked_up')
    .sort((a, b) => a.reservedAt - b.reservedAt)
  const distributed = mine
    .filter((d) => d.status === 'distributed')
    .sort((a, b) => b.distributedAt - a.distributedAt)

  return (
    <section className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-2xl font-bold text-brand-900">Marrjet e mia</h1>

      {active.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-ink/70">
          <p>Nuk ke rezervime aktive.</p>
          <Link to="/browse" className="mt-2 inline-block font-semibold text-brand-700 underline">
            Gjej ushqim afër teje
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {active.map((donation) => (
            <li key={donation.id}>
              <PickupRow donation={donation}>
                {donation.status === 'reserved' ? (
                  <NextStep urgent={reservationEndsAt(donation) - now < TEN_MINUTES}>
                    ⏳ Merre brenda{' '}
                    <strong className="tabular-nums">
                      {formatCountdown(reservationEndsAt(donation) - now)}
                    </strong>
                  </NextStep>
                ) : (
                  <NextStep>📦 Shëno shpërndarjen →</NextStep>
                )}
              </PickupRow>
            </li>
          ))}
        </ul>
      )}

      {distributed.length > 0 && (
        <>
          <h2 className="mt-2 text-sm font-semibold tracking-wide text-ink/60 uppercase">Të shpërndara</h2>
          <ul className="flex flex-col gap-2">
            {distributed.map((donation) => (
              <li key={donation.id}>
                <PickupRow donation={donation}>
                  <p className="text-sm text-ink/70">
                    👥 {donation.peopleHelped} persona · {formatClock(donation.distributedAt)}
                  </p>
                </PickupRow>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

// `children` is whatever is written between <PickupRow> and </PickupRow>.
function PickupRow({ donation, children }) {
  const foodType = FOOD_TYPES[donation.foodType]
  return (
    <Link
      to={`/donations/${donation.id}`}
      className="flex items-center gap-3 rounded-3xl bg-white p-4 ring-1 ring-brand-100 active:scale-[0.98]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cream-50 text-2xl">
        {foodType.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-brand-900">
            {foodType.label} · {donation.portions} porc.
          </p>
          <StatusBadge status={donation.status} />
        </div>
        <p className="truncate text-sm text-ink/70">{donation.businessName}</p>
        <div className="mt-1">{children}</div>
      </div>
    </Link>
  )
}

function NextStep({ urgent = false, children }) {
  return <p className={`text-sm font-medium ${urgent ? 'text-urgent-700' : 'text-brand-700'}`}>{children}</p>
}

export default PickupsPage
