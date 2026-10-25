import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS, ROLES } from '../lib/constants.js'

// Shared frame for every screen after role selection:
// green header on top, the current page in the middle (<Outlet />), navigation at the bottom
// (phone, tablet) or inside the header (computer, lg and up).
// Content width: phone max-w-md, tablet max-w-3xl, computer 1200px.
function AppLayout({ role, onChangeRole }) {
  // No role chosen yet -> back to role selection.
  if (!role) {
    return <Navigate to="/" replace />
  }

  const currentRole = ROLES[role]

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col md:max-w-none">
      {/* Extra top padding under the phone's status bar / notch when installed as an app.
          On tablet/computer the header is full width; the side padding lines its content up
          with the page content: (screen width − content width) / 2 */}
      <header className="flex items-center justify-between gap-4 bg-brand-900 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white md:px-[max(1rem,calc((100%-48rem)/2+1rem))] lg:px-[max(1rem,calc((100%-1200px)/2+1rem))]">
        <span className="font-display text-lg font-bold">Save the Food</span>

        {/* Computer: navigation lives in the header */}
        <nav className="hidden lg:block" aria-label="Menuja kryesore">
          <ul className="flex gap-1">
            {NAV_ITEMS[role].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex h-11 items-center gap-2 rounded-full px-4 font-semibold transition ${
                      isActive ? 'bg-white text-brand-900' : 'text-white/80 hover:bg-white/10 hover:text-white'
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

        <button
          type="button"
          onClick={onChangeRole}
          className="flex min-h-11 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm font-medium hover:bg-white/20"
        >
          <currentRole.Icon className="size-4" />
          {currentRole.label} · Ndrysho
        </button>
      </header>

      {/* pb-24 leaves room so the fixed bottom nav does not cover the content */}
      <main className="flex-1 pb-24 md:mx-auto md:w-full md:max-w-3xl lg:max-w-[1200px] lg:pb-12">
        {/* Pages read the role with useOutletContext() */}
        <Outlet context={{ role }} />
      </main>

      {/* Phone and tablet only. z-[1000]: above the Leaflet map, which uses z-index up to ~800 */}
      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-brand-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
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
