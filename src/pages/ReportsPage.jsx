import { ArrowLeft, Download, Printer } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { Stars } from '../components/Rating.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { useProfile } from '../hooks/useProfile.js'
import { CO2E_PER_KG_FOOD, FOOD_TYPES, ROLES } from '../lib/constants.js'
import { calculateImpact } from '../lib/impact.js'
import { PERIODS, downloadFile, formatDate, inPeriod, periodStart, toCsv } from '../lib/reports.js'
import { formatClock } from '../lib/time.js'

// A report of "my" donations for a period, to download (CSV for Excel) or print / save as PDF.
function ReportsPage() {
  const { role } = useOutletContext()
  const navigate = useNavigate()
  const profile = useProfile(role)
  const donations = useDonations()
  const now = useNow(60 * 1000)
  const [period, setPeriod] = useState('month')

  const mine = donations.filter((d) =>
    role === 'business' ? d.businessId === profile.id : d.reservedBy === role,
  )
  const rows = inPeriod(mine, period, now)
  const impact = calculateImpact(rows)
  const co2 = Math.round(impact.kg * CO2E_PER_KG_FOOD)
  const periodLabel = PERIODS.find((p) => p.value === period).label
  const range = `${formatDate(periodStart(period, now))} – ${formatDate(now)}`

  const summary = [
    { label: 'Donacione', value: rows.length },
    { label: 'Të shpërndara', value: impact.completedCount },
    { label: 'Porcione të shpëtuara', value: impact.portions },
    { label: 'Kg ushqim', value: impact.kg.toLocaleString('sq-AL') },
    { label: 'Persona të ndihmuar', value: impact.people },
    { label: 'Kg CO₂ të shmangura', value: `≈ ${co2}` },
  ]

  function downloadCsv() {
    downloadFile(`save-the-food-raporti-${period}-${formatDate(now).replaceAll('.', '-')}.csv`, toCsv(rows))
  }

  return (
    <section className="flex flex-col gap-5 p-4 lg:p-6 print:p-0">
      {/* ---------- Only on paper / PDF ---------- */}
      <div className="hidden items-center justify-between border-b border-ink/20 pb-4 print:flex">
        <div className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-xl font-semibold">Save the Food</span>
        </div>
        <p className="text-sm">Krijuar më {formatDate(now)}, ora {formatClock(now)}</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-1 flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 print:hidden"
          >
            <ArrowLeft className="size-4" /> Kthehu
          </button>
          <h1 className="font-display text-3xl font-semibold text-brand-900">Raporti · {periodLabel}</h1>
          <p className="text-ink/60">
            {profile.name} ({ROLES[role].label}) · {range}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="flex h-11 items-center gap-2 rounded-xl bg-card px-4 font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 disabled:opacity-50"
          >
            <Download className="size-4" /> CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 font-semibold text-white"
          >
            <Printer className="size-4" /> Printo / PDF
          </button>
        </div>
      </div>

      <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} className="md:max-w-md print:hidden" />

      {/* ---------- Summary ---------- */}
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-brand-100 print:shadow-none">
            <dt className="text-xs text-ink/60">{item.label}</dt>
            <dd className="mt-1 font-display text-2xl font-semibold text-brand-900">{item.value}</dd>
          </div>
        ))}
      </dl>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-ink/60 ring-1 ring-brand-100">
          Asnjë donacion në këtë periudhë.
        </p>
      ) : (
        <>
          {/* Phone: a list */}
          <ul className="flex flex-col gap-2 md:hidden print:hidden">
            {rows.map((d) => (
              <li key={d.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-brand-100">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-brand-900">
                    {FOOD_TYPES[d.foodType].label} · {d.portions} porc.
                  </p>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-sm text-ink/60">
                  {formatDate(d.createdAt)} · {formatClock(d.createdAt)}
                  {role !== 'business' && ` · ${d.businessName}`}
                </p>
                {d.status === 'distributed' && (
                  <p className="mt-1 flex items-center gap-2 text-sm">
                    {d.peopleHelped} persona {d.rating && <Stars value={d.rating.stars} size="size-3.5" />}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {/* Tablet, computer and print: a table */}
          <div className="hidden overflow-x-auto rounded-2xl bg-card shadow-sm ring-1 ring-brand-100 md:block print:block print:shadow-none">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-100 text-xs text-ink/60 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  {role !== 'business' && <th className="px-4 py-3 font-semibold">Biznesi</th>}
                  <th className="px-4 py-3 font-semibold">Ushqimi</th>
                  <th className="px-4 py-3 text-right font-semibold">Porcione</th>
                  <th className="px-4 py-3 text-right font-semibold">Kg</th>
                  <th className="px-4 py-3 font-semibold">Statusi</th>
                  <th className="px-4 py-3 text-right font-semibold">Persona</th>
                  <th className="px-4 py-3 font-semibold">Vlerësimi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(d.createdAt)} <span className="text-ink/50">{formatClock(d.createdAt)}</span>
                    </td>
                    {role !== 'business' && <td className="px-4 py-3">{d.businessName}</td>}
                    <td className="px-4 py-3">{FOOD_TYPES[d.foodType].label}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{d.portions}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{d.kg.toLocaleString('sq-AL')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{d.peopleHelped ?? '–'}</td>
                    <td className="px-4 py-3">{d.rating ? <Stars value={d.rating.stars} size="size-3.5" /> : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-ink/50">
        Porcionet, kg dhe personat llogariten vetëm nga donacionet e shpërndara. CO₂ është vlerësim
        (≈ {CO2E_PER_KG_FOOD.toLocaleString('sq-AL')} kg CO₂e për kg ushqim, FAO 2013).
      </p>
    </section>
  )
}

export default ReportsPage
