// Two or more buttons joined together, exactly one selected (e.g. Hartë | Listë).
// options: [{ value, label, Icon? }]
function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div
      className={`grid gap-1 rounded-2xl bg-white p-1 ring-1 ring-brand-100 ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex h-11 items-center justify-center gap-2 rounded-xl font-semibold transition ${
            value === option.value ? 'bg-brand-700 text-white' : 'text-ink/60'
          }`}
        >
          {option.Icon && <option.Icon className="size-5" />}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
