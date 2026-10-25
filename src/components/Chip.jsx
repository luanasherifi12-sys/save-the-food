// A big tappable choice button. `selected` changes its look.
// `Icon` is an optional lucide-react icon component.
function Chip({ selected, onClick, Icon, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-12 items-center gap-2 rounded-2xl px-4 text-base font-semibold ring-1 transition active:scale-95 ${
        selected
          ? 'bg-brand-700 text-white ring-brand-700'
          : 'bg-white text-ink ring-brand-100 hover:ring-brand-500'
      }`}
    >
      {Icon && <Icon className={`size-5 shrink-0 ${selected ? 'text-white' : 'text-brand-700'}`} />}
      {children}
    </button>
  )
}

export default Chip
