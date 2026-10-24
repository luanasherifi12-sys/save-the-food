import { Link, useParams } from 'react-router-dom'

function DonationDetailPage() {
  // The ":id" part of the address /donations/:id
  const { id } = useParams()

  return (
    <section className="p-4">
      <Link to="/browse" className="text-sm font-semibold text-brand-700">
        ← Kthehu
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-brand-900">Detajet e donacionit</h1>
      <p className="mt-2 text-ink/70">
        Donacioni <strong>{id}</strong>. Këtu do të jenë rezervimi, kodi dhe shpërndarja (Hapi 7).
      </p>
    </section>
  )
}

export default DonationDetailPage
