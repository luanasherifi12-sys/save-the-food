// "Duhet marrë së shpejti": a calm label with a colored dot. The card border carries the rest.
function UrgentBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-urgent-700 uppercase">
      <span className="size-2 rounded-full bg-urgent-500" />
      Duhet marrë së shpejti
    </span>
  )
}

export default UrgentBadge
