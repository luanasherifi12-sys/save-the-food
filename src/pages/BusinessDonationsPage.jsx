import { Link } from 'react-router-dom'
import DonationRow from '../components/DonationRow.jsx'
import ReservedCodeCard from '../components/ReservedCodeCard.jsx'
import UrgentBadge from '../components/UrgentBadge.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { DEMO_BUSINESS } from '../lib/constants.js'
import {
  formatClock,
  formatCountdown,
  isAvailable,
  isUrgent,
  releaseIfExpired,
} from '../lib/time.js'

// The groups, in the order the business needs them: what needs action first.
// `matches` decides which donations belong to the group, `sortBy` orders them inside it.
const GROUPS = [
  {
    key: 'reserved',
    title: 'Rezervuar – jepu kodin',
    matches: (d) => d.status === 'reserved',
    sortBy: (a, b) => a.reservedAt - b.reservedAt, // expires first -> on top
  },
  {
    key: 'waiting',
    title: 'Në pritje të rezervimit',
    matches: (d, now) => isAvailable(d, now),
    sortBy: (a, b) => a.pickupDeadline - b.pickupDeadline,
  },
  {
    key: 'picked_up',
    title: 'Marrë',
    matches: (d) => d.status === 'picked_up',
    sortBy: (a, b) => b.pickedUpAt - a.pickedUpAt,
  },
  {
    key: 'distributed',
    title: 'Shpërndarë',
    matches: (d) => d.status === 'distributed',
    sortBy: (a, b) => b.distributedAt - a.distributedAt,
  },
  {
    key: 'expired',
    title: 'Skaduar pa u marrë',
    // still "published", but the pickup deadline has passed
    matches: (d, now) => d.status === 'published' && !isAvailable(d, now),
    sortBy: (a, b) => b.pickupDeadline - a.pickupDeadline,
  },
]

function BusinessDonationsPage() {
  const donations = useDonations()
  const now = useNow()

  // Only this business's donations, with the 30-minute rule applied on screen.
  const mine = donations
    .map((d) => releaseIfExpired(d, now))
    .filter((d) => d.businessId === DEMO_BUSINESS.id)

  const groups = GROUPS.map((group) => ({
    ...group,
    items: mine.filter((d) => group.matches(d, now)).sort(group.sortBy),
  })).filter((group) => group.items.length > 0)

  return (
    <section className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Donacionet e mia</h1>
        <p className="mt-1 text-sm text-ink/70">
          🏪 {DEMO_BUSINESS.name} · {mine.length} {mine.length === 1 ? 'donacion' : 'donacione'}
        </p>
      </div>

      {mine.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-center text-ink/70">
          <p>Nuk ke publikuar ende ushqim.</p>
          <Link to="/publish" className="mt-2 inline-block font-semibold text-brand-700 underline">
            Publiko tani
          </Link>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-ink/60 uppercase">
            {group.title} ({group.items.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {group.items.map((donation) => (
              <li key={donation.id}>
                <GroupItem groupKey={group.key} donation={donation} now={now} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

// How one donation looks depends on the group it is in.
function GroupItem({ groupKey, donation, now }) {
  const createdAt = `Publikuar në ${formatClock(donation.createdAt)}`

  switch (groupKey) {
    case 'reserved':
      return <ReservedCodeCard donation={donation} now={now} showFood />

    case 'waiting': {
      const urgent = isUrgent(donation, now)
      return (
        <DonationRow donation={donation} subtitle={createdAt}>
          <p className={`text-sm font-medium ${urgent ? 'text-urgent-700' : 'text-brand-700'}`}>
            ⏰ Mbeten{' '}
            <strong className="tabular-nums">{formatCountdown(donation.pickupDeadline - now)}</strong> · deri{' '}
            {formatClock(donation.pickupDeadline)}
          </p>
          {urgent && (
            <div className="mt-1">
              <UrgentBadge />
            </div>
          )}
        </DonationRow>
      )
    }

    case 'picked_up':
      return (
        <DonationRow donation={donation} subtitle={createdAt}>
          <p className="text-sm text-brand-700">✓ U mor në {formatClock(donation.pickedUpAt)} · në shpërndarje</p>
        </DonationRow>
      )

    case 'distributed':
      return (
        <DonationRow donation={donation} subtitle={createdAt}>
          <p className="text-sm text-brand-700">👥 {donation.peopleHelped} persona u ndihmuan</p>
        </DonationRow>
      )

    case 'expired':
      return (
        <DonationRow donation={donation} subtitle={createdAt} muted>
          <p className="text-sm text-ink/70">Afati kaloi në {formatClock(donation.pickupDeadline)}</p>
        </DonationRow>
      )

    default:
      return null
  }
}

export default BusinessDonationsPage
