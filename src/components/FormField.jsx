import { useId } from 'react'

// A labelled text input. Extra props (type, inputMode, autoComplete, placeholder...) go to <input>.
// useId() gives a unique id so the <label> is connected to its input (click label -> focus input).
export function TextField({ label, hint, value, onChange, ...inputProps }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl bg-card px-4 ring-1 ring-brand-100 transition placeholder:text-ink/35 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        {...inputProps}
      />
      {hint && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
    </div>
  )
}

// An on/off switch with a title and a short explanation. role="switch" tells screen readers what it is.
export function Toggle({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span>
        <span className="block font-medium">{label}</span>
        {description && <span className="block text-sm text-ink/60">{description}</span>}
      </span>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-brand-700' : 'bg-ink/20'
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-white shadow-sm transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}

// A titled card used to group settings
export function SettingsCard({ title, description, children }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-brand-100">
      <h2 className="font-display text-xl font-semibold text-brand-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink/60">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
