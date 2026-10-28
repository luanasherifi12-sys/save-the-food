import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Logo from './Logo.jsx'
import NotificationBell from './NotificationBell.jsx'
import { NAV_ITEMS, ROLES } from '../lib/constants.js'

// Shared frame for every screen after role selection:
// green header on top, the current page in the middle (<Outlet />), navigation at the bottom
// (phone, tablet) or inside the header (computer, lg and up).
// Content width: phone max-w-md, tablet max-w-3xl, computer 1200px.
function AppLayout({ role, onChangeRole }) {
  const location = useLocation()

  // No role chosen yet -> back to role selection.
  // A shared donation link is remembered, so the person lands on it after choosing a role.
  if (!role) {
    const sharedDonation = location.pathname.startsWith('/donations/') ? location.pathname : null
    return <Navigate to="/" replace state={{ from: sharedDonation }} />
  }

  const currentRole = ROLES[role]

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col md:max-w-none">
      {/* Extra top padding under the phone's status bar / notch when installed as an app.
          On tablet/computer the header is full width; the side padding lines its content up
          with the page content: (screen width − content width) / 2 */}
      <header className="flex items-center justify-between gap-4 bg-header px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white md:px-[max(1rem,calc((100%-48rem)/2+1rem))] lg:px-[max(1rem,calc((100%-1200px)/2+1rem))]">
        <span className="flex items-center gap-2 font-display text-lg font-semibold whitespace-nowrap">
          <Logo className="size-7" onDark />
          Save the Food
        </span>

        {/* Computer: navigation lives in the header */}
        <nav className="hidden lg:block" aria-label="Menuja kryesore">
          <ul className="flex gap-1">
            {NAV_ITEMS[role].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex h-11 items-center gap-2 rounded-full px-4 font-semibold transition ${
                      isActive ? 'bg-white text-header' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <item.Icon className="size-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell role={role} />

          {/* Phones: only the role icon (the role can also be changed in Profili). From 640px: "Biznes · Ndrysho".
              aria-label gives the full meaning to screen readers. */}
          <button
            type="button"
            onClick={onChangeRole}
            aria-label={`Ndrysho rolin (tani: ${currentRole.label})`}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm font-medium whitespace-nowrap hover:bg-white/20"
          >
            <currentRole.Icon className="size-4" />
            <span className="hidden sm:inline">{currentRole.label} · Ndrysho</span>
            <ChevronDown className="size-4 opacity-70 sm:hidden" />
          </button>
        </div>
      </header>

      {/* pb-24 leaves room so the fixed bottom nav does not cover the content */}
      <main className="flex-1 pb-24 md:mx-auto md:w-full md:max-w-3xl lg:max-w-[1200px] lg:pb-12">
        {/* Pages read the role with useOutletContext() */}
        {/* key: a new page gets a fresh wrapper, so it fades in (animate-page-in) */}
        <div key={location.pathname} className="animate-page-in">
          <Outlet context={{ role, onChangeRole }} />
        </div>
      </main>

      {/* Phone and tablet only. z-[1000]: above the Leaflet map, which uses z-index up to ~800 */}
      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-brand-100 bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="mx-auto flex max-w-md">
          {NAV_ITEMS[role].map((item) => (
            <li key={item.to} className="flex-1">
              {/* NavLink tells us if its link is the current page (isActive) */}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                    isActive ? 'text-brand-700' : 'text-ink/50'
                  }`
                }
              >
                {/* children can be a function too: it gets isActive, so the icon gets a pill when active */}
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-7 w-14 items-center justify-center rounded-full transition ${
                        isActive ? 'bg-brand-100' : ''
                      }`}
                    >
                      <item.Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default AppLayout
