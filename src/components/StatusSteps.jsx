import { STATUSES } from '../lib/constants.js'

const ORDER = Object.keys(STATUSES) // ['published', 'reserved', 'picked_up', 'distributed']

// Progress bar of the 4 statuses: done steps are filled, the current one is highlighted.
function StatusSteps({ status }) {
  const currentIndex = ORDER.indexOf(status)

  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Statusi i donacionit">
      {ORDER.map((step, index) => {
        const done = index <= currentIndex
        return (
          <li
            key={step}
            aria-current={index === currentIndex ? 'step' : undefined}
            className="flex flex-col gap-1.5"
          >
            <span className={`h-2 rounded-full ${done ? 'bg-brand-700' : 'bg-brand-100'}`} />
            <span
              className={`text-center text-[11px] font-semibold ${
                index === currentIndex ? 'text-brand-900' : done ? 'text-brand-700' : 'text-ink/40'
              }`}
            >
              {STATUSES[step].label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default StatusSteps
