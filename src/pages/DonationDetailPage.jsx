import { ArrowLeft, Check, CircleCheck, Clock, Hourglass, Navigation, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '../lib/toast.js'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import BigButton from '../components/BigButton.jsx'
import ChipGroup from '../components/ChipGroup.jsx'
import Confetti from '../components/Confetti.jsx'
import DonationTags from '../components/DonationTags.jsx'
import FoodIcon from '../components/FoodIcon.jsx'
import InlineIcon from '../components/InlineIcon.jsx'
import NumberStepper from '../components/NumberStepper.jsx'
import ReservedCodeCard from '../components/ReservedCodeCard.jsx'
import ShareDonationButton from '../components/ShareDonationButton.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StatusSteps from '../components/StatusSteps.jsx'
import UrgentBadge from '../components/UrgentBadge.jsx'
import { useDonations } from '../hooks/useDonations.js'
import { useNow } from '../hooks/useNow.js'
import { DEMO_BUSINESS, FOOD_TYPES, RESERVATION_MINUTES, ROLES } from '../lib/constants.js'
import {
  cancelReservation,
  confirmPickup,
  markDistributed,
  reserveDonation,
} from '../lib/donationsStore.js'
import {
  formatClock,
  formatCountdown,
  isAvailable,
  isUrgent,
  releaseIfExpired,
  reservationEndsAt,
} from '../lib/time.js'

// The store answers with a short reason code; here it becomes a message for the user.
const REASON_MESSAGES = {
  'not-found': 'Ky donacion nuk u gjet.',
  'not-available': 'Na vjen keq, ky ushqim nuk është më në dispozicion.',
  'not-reserved': 'Rezervimi nuk është më aktiv (mund të ketë skaduar).',
  'wrong-code': 'Kodi nuk është i saktë. Kërkoja biznesit sërish.',
  'not-picked-up': 'Ky donacion nuk është shënuar ende si i marrë.',
  'invalid-people': 'Shkruaj sa persona u ndihmuan.',
}

const PEOPLE_PRESETS = [5, 10, 20, 50].map((n) => ({ value: n, label: String(n) }))

function DonationDetailPage() {
  const { id } = useParams() // the ":id" part of /donations/:id
  const { role } = useOutletContext()
  const navigate = useNavigate()
  const donations = useDonations()
  const now = useNow()
  const [error, setError] = useState(null)
  const [celebrate, setCelebrate] = useState(false) // true right after THIS person marked it distributed

  const stored = donations.find((d) => d.id === id)
  if (!stored) {
    return (
      <section className="p-4">
        <p className="rounded-2xl bg-card p-6 text-center text-ink/70">{REASON_MESSAGES['not-found']}</p>
        <Link to="/browse" className="mt-4 block text-center font-semibold text-brand-700 underline">
          Shiko ushqimin në dispozicion
        </Link>
      </section>
    )
  }

  // Apply the 30-minute rule on screen right away, not only when the data is re-read.
  const donation = releaseIfExpired(stored, now)
  const foodType = FOOD_TYPES[donation.foodType]
  const isCollector = role !== 'business'
  const isMine = donation.reservedBy === role
  const isOwnBusiness = role === 'business' && donation.businessId === DEMO_BUSINESS.id

  // Refused -> the error message stays on the page. Done -> a short toast with `successMessage`.
  function handleResult(result, successMessage) {
    setError(result.ok ? null : REASON_MESSAGES[result.reason])
    if (result.ok) showToast(successMessage)
    return result.ok
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${donation.lat},${donation.lng}`

  return (
    // Computer: two columns – the food info on the left, status and actions on the right
    <section className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-6 lg:p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex min-h-11 w-fit items-center gap-1 pr-4 text-sm font-semibold text-brand-700 lg:col-span-2"
      >
        <ArrowLeft className="size-4" /> Kthehu
      </button>

      <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-brand-100">
        <div className="flex items-start gap-3">
          <FoodIcon foodType={donation.foodType} size="xl" />
          <div className="min-w-0 flex-1">
            <StatusBadge status={donation.status} />
            <h1 className="mt-1 font-display text-2xl font-semibold text-brand-900">
              {foodType.label} · {donation.portions} porcione
            </h1>
            <p className="text-ink/70">
              {donation.businessName} · {donation.address}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <DonationTags donation={donation} />
        </div>

        {donation.note && (
          <p className="mt-4 rounded-2xl bg-cream-50 p-3 text-sm">
            <InlineIcon Icon={StickyNote} className="text-crust-700" />
            {donation.note}
          </p>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-brand-50 font-semibold text-brand-700"
        >
          <Navigation className="mr-2 size-5" /> Udhëzimet deri te biznesi
        </a>

        {/* Only food that someone can still take is worth sharing */}
        {isAvailable(donation, now) && (
          <div className="mt-3">
            <ShareDonationButton donation={donation} />
          </div>
        )}
      </div>

      {/* Right column on the computer. On phone/tablet `contents` makes this box disappear
          from the layout, so its children stack exactly as before. */}
      <div className="contents lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-4">
        <StatusSteps status={donation.status} />

        {/* role="alert": screen readers read the message as soon as it appears */}
        {error && (
          <p role="alert" className="rounded-2xl bg-urgent-50 p-3 font-medium text-urgent-700">
            {error}
          </p>
        )}

        {donation.status === 'published' && (
          <PublishedActions
            donation={donation}
            now={now}
            canReserve={isCollector}
            onReserve={() =>
              handleResult(
                reserveDonation(donation.id, role),
                `U rezervua! Ke ${RESERVATION_MINUTES} minuta për ta marrë.`,
              )
            }
          />
        )}

        {/* The business that published the food sees the pickup code instead of the collector's form */}
        {donation.status === 'reserved' && isOwnBusiness && <ReservedCodeCard donation={donation} now={now} />}

        {donation.status === 'reserved' && !isOwnBusiness && (
          <ReservedActions
            donation={donation}
            now={now}
            isMine={isMine}
            onConfirm={(code) => handleResult(confirmPickup(donation.id, code), 'Marrja u konfirmua.')}
            onCancel={() => handleResult(cancelReservation(donation.id), 'Rezervimi u anulua.')}
          />
        )}

        {donation.status === 'picked_up' && (
          <PickedUpActions
            donation={donation}
            isMine={isMine}
            onDistribute={(people) => {
              if (handleResult(markDistributed(donation.id, people), 'Faleminderit! Shpërndarja u shënua.')) {
                setCelebrate(true)
              }
            }}
          />
        )}

        {donation.status === 'distributed' && <DistributedSummary donation={donation} celebrate={celebrate} />}
      </div>
    </section>
  )
}

function Panel({ children }) {
  return <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 ring-1 ring-brand-100">{children}</div>
}

// Status 1: Published -> "Rezervo"
function PublishedActions({ donation, now, canReserve, onReserve }) {
  if (!isAvailable(donation, now)) {
    return (
      <Panel>
        <p className="text-center text-ink/70">Afati i marrjes ka kaluar.</p>
      </Panel>
    )
  }

  const urgent = isUrgent(donation, now)
  return (
    <Panel>
      {urgent && <UrgentBadge />}
      <p className={urgent ? 'text-urgent-700' : 'text-brand-700'}>
        <InlineIcon Icon={Clock} />
        Mbeten{' '}
        <strong className="text-xl tabular-nums">
          {formatCountdown(donation.pickupDeadline - now)}
        </strong>{' '}
        · deri {formatClock(donation.pickupDeadline)}
      </p>
      {canReserve ? (
        <>
          <BigButton onClick={onReserve}>Rezervo</BigButton>
          <p className="text-center text-sm text-ink/60">
            Pas rezervimit ke {RESERVATION_MINUTES} minuta për ta marrë.
          </p>
        </>
      ) : (
        <p className="text-sm text-ink/60">Në pritje të një organizate ose vullnetari.</p>
      )}
    </Panel>
  )
}

// Status 2: Reserved -> enter the 4-digit code from the business
function ReservedActions({ donation, now, isMine, onConfirm, onCancel }) {
  const [code, setCode] = useState('')
  const msLeft = reservationEndsAt(donation) - now

  const timeLeft = (
    <p className={msLeft < 10 * 60 * 1000 ? 'text-urgent-700' : 'text-crust-700'}>
      <InlineIcon Icon={Hourglass} />
      Rezervimi skadon për{' '}
      <strong className="text-xl tabular-nums">{formatCountdown(msLeft)}</strong>
    </p>
  )

  if (!isMine) {
    return (
      <Panel>
        <p className="font-semibold">E rezervuar nga një {ROLES[donation.reservedBy].label.toLowerCase()}.</p>
        {timeLeft}
        <p className="text-sm text-ink/60">Nëse nuk merret me kohë, bëhet sërish e lirë.</p>
      </Panel>
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    onConfirm(code)
  }

  return (
    <Panel>
      {timeLeft}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="pickup-code" className="font-semibold text-brand-900">
          Kur të arrish, kërkoji biznesit kodin 4-shifror:
        </label>
        <input
          id="pickup-code"
          value={code}
          // keep only digits, max 4
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="• • • •"
          className="h-16 w-full rounded-2xl bg-surface text-center font-display text-4xl font-semibold tracking-[0.5em] ring-2 ring-brand-100 focus:ring-brand-500 focus:outline-none"
        />
        <BigButton type="submit" disabled={code.length !== 4}>
          Konfirmo marrjen
        </BigButton>
      </form>
      <button type="button" onClick={onCancel} className="py-2 text-sm font-semibold text-ink/60 underline">
        Anulo rezervimin
      </button>
    </Panel>
  )
}

// Status 3: Picked up -> how many people were helped
function PickedUpActions({ donation, isMine, onDistribute }) {
  const [people, setPeople] = useState(10)

  if (!isMine) {
    return (
      <Panel>
        <p className="text-ink/70">
          U mor në {formatClock(donation.pickedUpAt)}. Në pritje të shpërndarjes.
        </p>
      </Panel>
    )
  }

  return (
    <Panel>
      <p className="text-brand-700">
        <InlineIcon Icon={CircleCheck} />U mor në {formatClock(donation.pickedUpAt)}
      </p>
      <h2 className="font-semibold text-brand-900">Sa persona u ndihmuan?</h2>
      <NumberStepper
        value={people}
        onChange={setPeople}
        max={1000}
        decreaseLabel="Më pak persona"
        increaseLabel="Më shumë persona"
      />
      <ChipGroup options={PEOPLE_PRESETS} value={people} onChange={setPeople} />
      <BigButton onClick={() => onDistribute(people)}>Shënoje si të shpërndarë</BigButton>
    </Panel>
  )
}

// Status 4: Distributed -> summary
// `celebrate`: the person just marked it distributed -> the check mark pops in with confetti.
function DistributedSummary({ donation, celebrate }) {
  return (
    <Panel>
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span
          className={`relative flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 ${
            celebrate ? 'animate-pop-in' : ''
          }`}
        >
          <Check className="size-8" strokeWidth={2.5} />
          {celebrate && <Confetti />}
        </span>
        <p className="font-display text-xl font-semibold text-brand-900">
          {donation.peopleHelped} persona u ndihmuan
        </p>
        <p className="text-sm text-ink/70">
          Shpërndarë në {formatClock(donation.distributedAt)} · {donation.portions} porcione ·{' '}
          {donation.kg.toLocaleString('sq-AL')} kg ushqim i shpëtuar
        </p>
      </div>
    </Panel>
  )
}

export default DonationDetailPage
