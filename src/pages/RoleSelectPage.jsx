import { ArrowDown, ArrowRight, ExternalLink, Hand, HeartHandshake, KeyRound, Megaphone } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import ActivityFeed from '../components/ActivityFeed.jsx'
import DonationMap from '../components/DonationMap.jsx'
import Logo from '../components/Logo.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { ROLES } from '../lib/constants.js'
import { HISTORY_DAYS, createDailyHistory, sumDays } from '../lib/history.js'
import { calculateImpact } from '../lib/impact.js'
import { isAvailable } from '../lib/time.js'

const GITHUB_URL = 'https://github.com/luanasherifi12-sys/save-the-food'

const CONTAINER = 'mx-auto w-full max-w-5xl px-6 lg:max-w-6xl'

const STEPS = [
  {
    Icon: Megaphone,
    title: 'Biznesi publikon',
    text: 'Lloji, porcionet, afati dhe alergjenët – me pak prekje, për më pak se 60 sekonda.',
  },
  {
    Icon: Hand,
    title: 'Organizata rezervon',
    text: 'Ushqimi shfaqet menjëherë në hartë. Kush është më afër e rezervon për 30 minuta.',
  },
  {
    Icon: KeyRound,
    title: 'Marrja me kod',
    text: 'Biznesi tregon një kod 4-shifror. Pa letra, pa telefonata, pa ngatërresa.',
  },
  {
    Icon: HeartHandshake,
    title: 'Ushqimi shpërndahet',
    text: 'Shënohet sa persona u ndihmuan – dhe ndikimi rritet live për gjithë qytetin.',
  },
]

// The first screen: what Save the Food is, live numbers, and the role choice.
function RoleSelectPage({ role, onSelectRole }) {
  const location = useLocation()
  const donations = useDonations()
  const now = useNow()

  // A role is already chosen (also right after a click) -> go to that role's home screen,
  // or back to the shared donation link that brought the person here.
  if (role) {
    return <Navigate to={location.state?.from ?? ROLES[role].homePath} replace />
  }

  const available = donations.filter((d) => isAvailable(d, now))
  const availablePortions = available.reduce((sum, d) => sum + d.portions, 0)

  // The last 14 days: demo history + today's real numbers
  const today = calculateImpact(donations)
  const totals = sumDays([...createDailyHistory(now), { ...today, donations: today.completedCount }])

  return (
    <div className="flex min-h-svh flex-col">
      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden bg-header text-white">
        {/* soft glows in the background, like the link preview image */}
        <div className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(31,157,99,0.45),transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-56 -left-40 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(200,137,63,0.25),transparent_65%)]" />

        <div className={`relative ${CONTAINER} pt-[calc(1.25rem+env(safe-area-inset-top))] pb-12 lg:pb-16`}>
          <div className="flex items-center gap-2">
            <Logo className="size-8" onDark />
            <span className="font-display text-lg font-semibold">Save the Food</span>
          </div>

          <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
            <div>
              {/* "Live" pill: the pulsing dot says the numbers are real-time */}
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-header-soft ring-1 ring-white/15">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
                </span>
                Live në Prishtinë · {available.length} donacione tani
              </p>

              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold md:text-6xl">
                Ushqimi që mund të ndihmojë dikë nuk duhet të bëhet mbeturinë.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-header-soft">
                Furrat, restorantet dhe marketet publikojnë tepricën për 60 sekonda. Organizatat dhe
                vullnetarët e marrin para se të humbasë.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#roli"
                  className="flex h-12 items-center gap-2 rounded-xl bg-white px-5 font-semibold text-header transition hover:bg-header-soft"
                >
                  Fillo tani <ArrowDown className="size-4" />
                </a>
                <a
                  href="#si-funksionon"
                  className="flex h-12 items-center rounded-xl px-5 font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10"
                >
                  Si funksionon
                </a>
              </div>

              {/* Big numbers that count up */}
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                <HeroStat value={totals.portions} label="porcione të shpëtuara" />
                <HeroStat value={totals.kg} label="kg ushqim" />
                <HeroStat value={totals.people} label="persona të ndihmuar" />
              </dl>
              <p className="mt-3 text-xs text-header-soft/70">{HISTORY_DAYS} ditët e fundit · të dhëna demo</p>
            </div>

            {/* Computer: the live map as the picture next to the title */}
            <div className="relative mt-12 hidden lg:mt-0 lg:block">
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15">
                <DonationMap
                  donations={available}
                  now={now}
                  selectedId={null}
                  onSelect={() => {}}
                  scrollWheelZoom={false}
                  className="h-[26rem] !rounded-none !ring-0"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 z-[1000] rounded-xl bg-card px-4 py-3 text-ink shadow-xl ring-1 ring-brand-100">
                <p className="text-xs text-ink/60">Në dispozicion tani</p>
                <p className="font-display text-2xl font-semibold text-brand-900 tabular-nums">
                  {availablePortions} porcione
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------- Choose a role ---------- */}
        <section id="roli" className={`${CONTAINER} scroll-mt-6 py-12`}>
          <h2 className="font-display text-2xl font-semibold text-brand-900">Kush je ti?</h2>
          <p className="mt-1 text-ink/70">Zgjidh rolin për të vazhduar. Mund ta ndryshosh kurdo.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {Object.values(ROLES).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRole(r.id)}
                className="group flex items-center gap-4 rounded-2xl bg-card p-5 text-left ring-1 ring-brand-100 transition hover:ring-brand-500 active:scale-[0.99] lg:flex-col lg:items-start lg:p-6 lg:hover:-translate-y-0.5 lg:hover:shadow-lg"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <r.Icon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-lg font-semibold text-brand-900">
                    {r.label}
                    <ArrowRight className="size-4 text-brand-700 transition group-hover:translate-x-1" />
                  </span>
                  <span className="mt-0.5 block text-sm text-ink/70">{r.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="si-funksionon" className="scroll-mt-6 border-y border-brand-100 bg-card py-12">
          <div className={CONTAINER}>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Si funksionon</h2>
            <p className="mt-1 text-ink/70">Nga teprica te tryeza, në katër hapa.</p>

            <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4 lg:flex-col">
                  <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-header text-white">
                    <step.Icon className="size-6" />
                    <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-crust-500 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="font-semibold text-brand-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink/70">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Live activity ---------- */}
        <section className={`${CONTAINER} py-12 lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-12`}>
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Tani në Prishtinë</h2>
            <p className="mt-1 text-ink/70">
              Çdo publikim, rezervim dhe shpërndarje shfaqet këtu në çast. Hape app-in në dy dritare dhe
              shiko si lëviz.
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-brand-100 lg:mt-0">
            <ActivityFeed limit={5} />
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-100 pb-[env(safe-area-inset-bottom)]">
        <div
          className={`${CONTAINER} flex flex-col gap-3 py-8 text-sm text-ink/60 md:flex-row md:items-center md:justify-between`}
        >
          <div className="flex items-center gap-2">
            <Logo className="size-5" />
            <span>Save the Food · projekt civic-tech, Prishtinë</span>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline"
          >
            Kodi në GitHub <ExternalLink className="size-3.5" />
          </a>
        </div>
      </footer>
    </div>
  )
}

function HeroStat({ value, label }) {
  const shown = useCountUp(value)
  // kg can have a decimal; portions and people are whole numbers
  const decimals = Number.isInteger(value) ? 0 : 1
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-2xl font-semibold tabular-nums md:text-4xl">
        {shown.toLocaleString('sq-AL', { maximumFractionDigits: decimals })}
      </dd>
      <dd className="mt-1 text-xs text-header-soft md:text-sm" aria-hidden="true">
        {label}
      </dd>
    </div>
  )
}

export default RoleSelectPage
