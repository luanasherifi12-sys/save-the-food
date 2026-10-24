import { Link } from 'react-router-dom'

function BrowsePage() {
  return (
    <section className="p-4">
      <h1 className="font-display text-2xl font-bold text-brand-900">Ushqimi afër teje</h1>
      <p className="mt-2 text-ink/70">Këtu do të jenë harta dhe lista me filtra (Hapat 2, 5, 6).</p>

      {/* Temporary link to test the detail route */}
      <Link
        to="/donations/demo-1"
        className="mt-6 block rounded-2xl bg-white p-4 font-semibold text-brand-700 ring-1 ring-brand-100"
      >
        🍞 Shembull: hap detajet e një donacioni →
      </Link>
    </section>
  )
}

export default BrowsePage
