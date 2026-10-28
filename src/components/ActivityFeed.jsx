import { CircleCheckBig, Hand, Megaphone, Truck } from 'lucide-react'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { buildActivity } from '../lib/activity.js'
import { formatTimeAgo } from '../lib/time.js'

const KIND_ICONS = {
  published: Megaphone,
  reserved: Hand,
  picked_up: Truck,
  distributed: CircleCheckBig,
}

// "Tani në Prishtinë": the latest things that happened, updated live.
// New events slide in (animate-feed-in in index.css), so the page feels alive.
function ActivityFeed({ limit = 5 }) {
  const donations = useDonations()
  const now = useNow(15000) // relative times ("para 3 min") only need a refresh every 15 s
  const events = buildActivity(donations, now, limit)

  return (
    <ol className="flex flex-col" aria-live="polite">
      {events.map((event, index) => {
        const Icon = KIND_ICONS[event.kind]
        return (
          <li key={event.id} className="animate-feed-in flex gap-3 py-2.5">
            {/* the timeline: an icon and a thin line down to the next event */}
            <div className="flex flex-col items-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="size-4" />
              </span>
              {index < events.length - 1 && <span className="mt-1 w-px flex-1 bg-brand-100" />}
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-sm leading-snug">{event.text}</p>
              <p className="mt-0.5 text-xs text-ink/50">{formatTimeAgo(event.time, now)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default ActivityFeed
