import { Bell, CircleCheckBig, Clock, Hand, Hourglass, PackageCheck, Settings, TimerOff, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { useProfile } from '../hooks/useProfile.js'
import { buildNotifications, getLastSeen, markSeen } from '../lib/notifications.js'
import { formatTimeAgo } from '../lib/time.js'

const KIND_STYLES = {
  reserved: { Icon: Hand, color: 'bg-cream-100 text-crust-700' },
  picked_up: { Icon: Truck, color: 'bg-brand-50 text-brand-700' },
  distributed: { Icon: CircleCheckBig, color: 'bg-brand-50 text-brand-700' },
  expired: { Icon: TimerOff, color: 'bg-urgent-50 text-urgent-700' },
  urgent: { Icon: Clock, color: 'bg-urgent-50 text-urgent-700' },
  expiring: { Icon: Hourglass, color: 'bg-urgent-50 text-urgent-700' },
  reminder: { Icon: PackageCheck, color: 'bg-cream-100 text-crust-700' },
}

// The bell in the header: a badge with the number of new notifications and a panel with the list.
function NotificationBell({ role }) {
  const donations = useDonations()
  const profile = useProfile(role)
  const now = useNow(30 * 1000)
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => getLastSeen(role))
  const [seenWhenOpened, setSeenWhenOpened] = useState(lastSeen) // to keep the "new" dots while open
  const wrapperRef = useRef(null)

  const notifications = buildNotifications(donations, profile, now)
  const unread = notifications.filter((n) => n.time > lastSeen).length

  // A different role was chosen -> its own "seen" time
  useEffect(() => setLastSeen(getLastSeen(role)), [role])

  function toggle() {
    if (!open) {
      const openedAt = Date.now() // exact time; `now` only updates every 30 seconds
      setSeenWhenOpened(lastSeen)
      markSeen(role, openedAt)
      setLastSeen(openedAt)
    }
    setOpen(!open)
  }

  // Close with Escape or a click outside the panel
  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    const onClick = (event) => !wrapperRef.current?.contains(event.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onClick)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={unread > 0 ? `Njoftimet, ${unread} të reja` : 'Njoftimet'}
        className="relative flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-crust-500 px-1 text-[11px] font-semibold text-white ring-2 ring-header">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        // Phone: a sheet under the header, full width. Computer: a dropdown under the bell.
        <div className="animate-toast-in fixed inset-x-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-[1100] flex max-h-[70svh] flex-col overflow-hidden rounded-2xl bg-card text-ink shadow-lg ring-1 ring-brand-100 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-brand-100 px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-brand-900">Njoftimet</h2>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              aria-label="Cilësimet e njoftimeve"
              className="flex size-9 items-center justify-center rounded-full text-ink/60 hover:bg-brand-50"
            >
              <Settings className="size-4" />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink/60">
              Asnjë njoftim për momentin.
              <br />
              Do të të njoftojmë sapo të ndodhë diçka.
            </p>
          ) : (
            <ul className="divide-y divide-brand-100 overflow-y-auto">
              {notifications.map((n) => {
                const { Icon, color } = KIND_STYLES[n.kind]
                const isNew = n.time > seenWhenOpened
                return (
                  <li key={n.id}>
                    <Link
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className={`flex gap-3 px-4 py-3 transition hover:bg-brand-50 ${isNew ? 'bg-cream-50/60' : ''}`}
                    >
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${color}`}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-brand-900">{n.title}</span>
                          {isNew && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-crust-500" aria-label="e re" />}
                        </span>
                        <span className="mt-0.5 block text-sm text-ink/70">{n.body}</span>
                        <span className="mt-1 block text-xs text-ink/50">{formatTimeAgo(n.time, now)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
