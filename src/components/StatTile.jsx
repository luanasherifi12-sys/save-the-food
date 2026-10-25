// One headline number: icon, big value, short label.
function StatTile({ icon, value, label }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-white p-4 ring-1 ring-brand-100">
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <span className="font-display text-3xl font-bold text-brand-900 tabular-nums">{value}</span>
      <span className="text-sm leading-tight text-ink/70">{label}</span>
    </div>
  )
}

export default StatTile
