import { Navigate } from 'react-router-dom'
import { ROLES } from '../lib/constants.js'

function RoleSelectPage({ role, onSelectRole }) {
  // A role is already chosen (also right after a click) -> go to that role's home screen.
  if (role) {
    return <Navigate to={ROLES[role].homePath} replace />
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col">
      <header className="rounded-b-[2.5rem] bg-brand-900 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-10 text-white">
        <p className="text-xs font-semibold tracking-widest text-brand-100 uppercase">
          Platforma civic-tech · Prishtinë
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">Save the Food</h1>
        <p className="mt-3 text-brand-100">
          Ushqimi që mund të ndihmojë dikë nuk duhet të bëhet mbeturinë.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6">
        <h2 className="font-display text-xl font-bold text-brand-900">Kush je ti?</h2>

        {Object.values(ROLES).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRole(r.id)}
            className="flex min-h-24 items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-brand-100 transition hover:ring-brand-500 active:scale-[0.98]"
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
