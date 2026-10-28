import { Lock } from 'lucide-react'

// Achievements: earned ones in gold, the others greyed out with a small progress bar.
function BadgeGrid({ badges }) {
  const earned = badges.filter((b) => b.earned).length
  return (
    <div>
      <p className="text-sm text-ink/60">
        {earned} nga {badges.length} arritje
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center ring-1 ${
              b.earned ? 'bg-cream-50 ring-crust-500/40' : 'bg-surface ring-brand-100'
            }`}
          >
            <span
              className={`relative flex size-12 items-center justify-center rounded-full ${
                b.earned ? 'bg-crust-500 text-white shadow-md' : 'bg-ink/10 text-ink/40'
              }`}
            >
              <b.Icon className="size-6" />
              {!b.earned && (
                <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-card ring-1 ring-brand-100">
                  <Lock className="size-3" />
                </span>
              )}
            </span>
            <span className={`text-sm font-semibold ${b.earned ? 'text-brand-900' : 'text-ink/60'}`}>{b.title}</span>
            <span className="text-xs text-ink/55">{b.description}</span>
            {!b.earned && (
              <span className="w-full">
                <span className="block h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <span className="block h-full rounded-full bg-crust-500" style={{ width: `${b.progress * 100}%` }} />
                </span>
                <span className="mt-1 block text-[11px] text-ink/50 tabular-nums">{b.progressText}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BadgeGrid
