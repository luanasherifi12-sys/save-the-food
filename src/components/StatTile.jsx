// One headline number: icon, big value, short label.
function StatTile({ Icon, value, label }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-card p-4 ring-1 ring-brand-100">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="size-5" />
      </span>
      <span className="font-display text-3xl font-semibold text-brand-900 tabular-nums">{value}</span>
      <span className="text-sm leading-tight text-ink/70">{label}</span>
    </div>
  )
}

export default StatTile
