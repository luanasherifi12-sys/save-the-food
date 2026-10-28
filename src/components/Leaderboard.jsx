// "Bizneset e javës": ranks 1–5. The first three get gold/silver/bronze circles.
const MEDALS = ['bg-crust-500 text-white', 'bg-[#a8a29a] text-white', 'bg-[#a86a3d] text-white']

function Leaderboard({ rows, highlightId }) {
  const max = Math.max(...rows.map((r) => r.portions), 1)
  return (
    <ol className="flex flex-col gap-3">
      {rows.map((row, index) => {
        const isYou = row.id === highlightId
        return (
          <li key={row.id} className={`flex items-center gap-3 rounded-xl p-2 ${isYou ? 'bg-cream-50 ring-1 ring-crust-500/40' : ''}`}>
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                MEDALS[index] ?? 'bg-ink/10 text-ink/60'
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-medium">
                  {row.name}
                  {isYou && <span className="ml-1.5 text-xs font-semibold text-crust-700">· Ti</span>}
                </p>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{row.portions} porc.</p>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-brand-50">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(row.portions / max) * 100}%` }} />
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default Leaderboard
