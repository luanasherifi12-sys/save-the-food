import { ChevronRight, Hourglass, Package, Users } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import DonationRow from '../components/DonationRow.jsx'
import InlineIcon from '../components/InlineIcon.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
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
              <DonationRow donation={donation}>
                {donation.status === 'reserved' ? (
                  <NextStep urgent={reservationEndsAt(donation) - now < TEN_MINUTES}>
                    <InlineIcon Icon={Hourglass} />
                    Merre brenda{' '}
                    <strong className="tabular-nums">
                      {formatCountdown(reservationEndsAt(donation) - now)}
                    </strong>
                  </NextStep>
                ) : (
                  <NextStep>
                    <InlineIcon Icon={Package} />
                    Shëno shpërndarjen
                    <InlineIcon Icon={ChevronRight} />
                  </NextStep>
                )}
              </DonationRow>
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
                <DonationRow donation={donation}>
                  <p className="text-sm text-ink/70">
                    <InlineIcon Icon={Users} />
                    {donation.peopleHelped} persona · {formatClock(donation.distributedAt)}
                  </p>
                </DonationRow>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function NextStep({ urgent = false, children }) {
  return <p className={`text-sm font-medium ${urgent ? 'text-urgent-700' : 'text-brand-700'}`}>{children}</p>
}

export default PickupsPage
