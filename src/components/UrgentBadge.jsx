function UrgentBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-urgent-500 px-3 py-1 text-xs font-bold text-white">
      {/* small pulsing dot to draw attention */}
      <span className="size-2 animate-pulse rounded-full bg-white" />
      Duhet marrë së shpejti
    </span>
  )
}

export default UrgentBadge
