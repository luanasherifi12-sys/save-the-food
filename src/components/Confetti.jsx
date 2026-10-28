const COLORS = ['bg-brand-500', 'bg-crust-500', 'bg-urgent-500', 'bg-brand-700']

// A small burst of confetti from the middle of its parent (the parent needs `relative`).
// Pure CSS animation; each piece gets its own direction through CSS variables --x, --y, --r.
// Hidden for people who asked for less motion (see index.css).
function Confetti({ pieces = 26 }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * 2 * Math.PI
        const distance = 70 + ((i * 37) % 50) // 70–120 px, different for each piece
        return (
          <span
            key={i}
            className={`animate-confetti absolute h-3 w-1.5 rounded-sm ${COLORS[i % COLORS.length]}`}
            style={{
              '--x': `${Math.cos(angle) * distance}px`,
              '--y': `${Math.sin(angle) * distance - 20}px`,
              '--r': `${(i * 67) % 360}deg`,
              animationDelay: `${(i % 5) * 30}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

export default Confetti
