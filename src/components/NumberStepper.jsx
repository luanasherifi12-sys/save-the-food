// Big − / + buttons around a number. Keeps the value between min and max.
function NumberStepper({ value, onChange, min = 1, max = 500, decreaseLabel, increaseLabel }) {
  function change(newValue) {
    onChange(Math.min(max, Math.max(min, newValue)))
  }

  const buttonClass =
    'size-14 rounded-2xl bg-white text-3xl font-bold text-brand-700 ring-1 ring-brand-100 active:scale-95'

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => change(value - 1)} aria-label={decreaseLabel} className={buttonClass}>
        −
      </button>
      <span className="w-20 text-center font-display text-4xl font-bold text-brand-900 tabular-nums">
        {value}
      </span>
      <button type="button" onClick={() => change(value + 1)} aria-label={increaseLabel} className={buttonClass}>
        +
      </button>
    </div>
  )
}

export default NumberStepper
