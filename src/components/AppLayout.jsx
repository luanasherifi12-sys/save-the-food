import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS, ROLES } from '../lib/constants.js'

// Shared frame for every screen after role selection:
// green header on top, the current page in the middle (<Outlet />), big navigation buttons at the bottom.
function AppLayout({ role, onChangeRole }) {
  // No role chosen yet -> back to role selection.
  if (!role) {
    return <Navigate to="/" replace />
  }

  const currentRole = ROLES[role]

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col">
      <header className="flex items-center justify-between bg-brand-900 px-4 py-3 text-white">
        <span className="font-display text-lg font-bold">Save the Food</span>
        <button
          type="button"
          onClick={onChangeRole}
          className="rounded-full bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
        >
          {currentRole.icon} {currentRole.label} · Ndrysho
        </button>
      </header>

      {/* pb-24 leaves room so the fixed bottom nav does not cover the content */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-brand-100 bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto flex max-w-md">
          {NAV_ITEMS[role].map((item) => (
            <li key={item.to} className="flex-1">
              {/* NavLink tells us if its link is the current page (isActive) */}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                    isActive ? 'text-brand-700' : 'text-ink/50'
                  }`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default AppLayout
