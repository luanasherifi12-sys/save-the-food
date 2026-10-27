import { Navigate, useLocation } from 'react-router-dom'
import { ROLES } from '../lib/constants.js'

function RoleSelectPage({ role, onSelectRole }) {
  const location = useLocation()

  // A role is already chosen (also right after a click) -> go to that role's home screen,
  // or back to the shared donation link that brought the person here.
  if (role) {
    return <Navigate to={location.state?.from ?? ROLES[role].homePath} replace />
  }

  return (
    // Tablet/computer: full-width header, role cards in a wider column (3 side by side on the computer)
    <div className="mx-auto flex min-h-svh max-w-md flex-col md:max-w-none">
      <header className="bg-header px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-10 text-white md:px-[max(1.5rem,calc((100%-48rem)/2+1.5rem))] md:pt-[calc(4rem+env(safe-area-inset-top))] md:pb-14 lg:px-[max(1.5rem,calc((100%-64rem)/2+1.5rem))]">
        <p className="text-xs font-semibold tracking-widest text-header-soft uppercase">
          Platforma civic-tech · Prishtinë
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">Save the Food</h1>
        <p className="mt-3 text-header-soft md:max-w-xl md:text-xl">
          Ushqimi që mund të ndihmojë dikë nuk duhet të bëhet mbeturinë.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6 md:mx-auto md:w-full md:max-w-3xl md:py-10 lg:grid lg:max-w-5xl lg:grid-cols-3 lg:content-start lg:gap-6">
        <h2 className="font-display text-xl font-semibold text-brand-900 lg:col-span-3 lg:text-2xl">Kush je ti?</h2>

        {Object.values(ROLES).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRole(r.id)}
            className="flex min-h-24 items-center gap-4 rounded-3xl bg-card p-4 text-left shadow-sm ring-1 ring-brand-100 transition hover:ring-brand-500 active:scale-[0.98] lg:flex-col lg:items-start lg:p-6 lg:hover:-translate-y-1 lg:hover:shadow-md"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <r.Icon className="size-7" />
            </span>
            <span>
              <span className="block text-lg font-semibold text-brand-900">{r.label}</span>
              <span className="block text-sm text-ink/70">{r.description}</span>
            </span>
          </button>
        ))}
      </main>
    </div>
  )
}

export default RoleSelectPage
