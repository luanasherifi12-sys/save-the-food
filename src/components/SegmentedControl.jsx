// Two or more buttons joined together, exactly one selected (e.g. Hartë | Listë).
// options: [{ value, label, icon? }]
function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      className="grid gap-1 rounded-2xl bg-white p-1 ring-1 ring-brand-100"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`h-11 rounded-xl font-semibold transition ${
            value === option.value ? 'bg-brand-700 text-white' : 'text-ink/60'
          }`}
        >
          {option.icon && `${option.icon} `}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
