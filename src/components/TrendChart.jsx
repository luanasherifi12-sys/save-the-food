import { useState } from 'react'

const WEEKDAYS = ['E diel', 'E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë']
const WEEKDAYS_SHORT = ['Di', 'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh']
const MONTHS = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor']

function formatDay(timestamp) {
  const date = new Date(timestamp)
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

// Bar chart of portions saved per day. One color (one series); today is darker.
// Hover or focus (keyboard) a bar to see its exact number.
// days: [{ date, portions }], oldest first, the last one is today.
function TrendChart({ days }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const max = Math.max(...days.map((d) => d.portions), 1)
  const average = Math.round(days.reduce((sum, d) => sum + d.portions, 0) / days.length)

  return (
    <div>
      {/* The plot. pt-8 leaves room for the tooltip above the tallest bar. */}
      <div className="relative pt-8">
        {/* Average line: a quiet reference, labelled on the right */}
        {/* z-10: drawn over the bars, so the label is never hidden behind a tall bar */}
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-ink/30"
          style={{ bottom: `${(average / max) * 10}rem` }}
        >
          <span className="absolute -top-5 right-0 rounded bg-card/90 px-1 text-[11px] text-ink/60">
            mesatarja {average}
          </span>
        </div>

        <ol className="flex h-40 items-end gap-1 border-b border-brand-100 sm:gap-1.5">
          {days.map((day, index) => {
            const isToday = index === days.length - 1
            const isActive = activeIndex === index
            return (
              <li
                key={day.date}
                tabIndex={0}
                aria-label={`${isToday ? 'Sot' : formatDay(day.date)}: ${day.portions} porcione`}
                onPointerEnter={() => setActiveIndex(index)}
                onPointerLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                // the whole column is the hover target, bigger than the bar itself
                className="relative flex h-full flex-1 items-end outline-none"
              >
                <div
                  className={`animate-bar-grow w-full origin-bottom rounded-t-[4px] transition-colors ${
                    isToday ? 'bg-brand-700' : isActive ? 'bg-brand-500' : 'bg-brand-500/45'
                  }`}
                  style={{ height: `${(day.portions / max) * 100}%`, animationDelay: `${index * 35}ms` }}
                />
                {isActive && (
                  <div
                    className={`absolute bottom-full z-10 mb-1 rounded-lg bg-header px-2.5 py-1.5 text-center whitespace-nowrap text-white shadow-lg ${
                      // keep the tooltip inside the chart at the left and right edges
                      index < 2 ? 'left-0' : index > days.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <p className="text-sm font-semibold tabular-nums">{day.portions} porcione</p>
                    <p className="text-[11px] text-header-soft">{isToday ? 'Sot' : formatDay(day.date)}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {/* Day labels under the bars */}
      <ol className="mt-1.5 flex gap-1 sm:gap-1.5" aria-hidden="true">
        {days.map((day, index) => (
          <li
            key={day.date}
            className={`flex-1 text-center text-[11px] ${
              index === days.length - 1 ? 'font-semibold text-brand-700' : 'text-ink/50'
            }`}
          >
            {index === days.length - 1 ? 'Sot' : WEEKDAYS_SHORT[new Date(day.date).getDay()]}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default TrendChart
