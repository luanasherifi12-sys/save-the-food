import { Check, Clock, RotateCcw, Store, Timer } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BigButton from '../components/BigButton.jsx'
import Chip from '../components/Chip.jsx'
import ChipGroup from '../components/ChipGroup.jsx'
import FoodIcon from '../components/FoodIcon.jsx'
import InlineIcon from '../components/InlineIcon.jsx'
import NumberStepper from '../components/NumberStepper.jsx'
import { useDonations } from '../hooks/useDonations.js'
import {
  ALLERGENS,
  DEMO_BUSINESS,
  FOOD_TYPES,
  STORAGE_TYPES,
  estimateKg,
  toOptions,
} from '../lib/constants.js'
import { addDonation } from '../lib/donationsStore.js'
import { formatClock } from '../lib/time.js'

const MINUTE = 60 * 1000
const MAX_PORTIONS = 500
const PORTION_PRESETS = [5, 10, 20, 30, 50].map((n) => ({ value: n, label: String(n) }))
const DEADLINE_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 orë' },
  { value: 120, label: '2 orë' },
  { value: 180, label: '3 orë' },
  { value: 240, label: '4 orë' },
]

// Type, storage and allergens start empty on purpose: the business must choose them (food safety).
const EMPTY_FORM = {
  foodType: null,
  portions: 10,
  deadlineMinutes: 120,
  storage: null,
  allergens: [],
  kgOverride: null, // null = use the automatic estimate
  note: '',
}

function formatKg(kg) {
  return kg.toLocaleString('sq-AL')
}

// The deadline option closest to how long the last donation stayed available.
function closestDeadline(minutes) {
  return DEADLINE_OPTIONS.reduce((best, option) =>
    Math.abs(option.value - minutes) < Math.abs(best.value - minutes) ? option : best,
  ).value
}

// The business's most recent donation, or null. Bakeries often have the same surplus every day.
function findLastDonation(donations) {
  const own = donations.filter((d) => d.businessId === DEMO_BUSINESS.id && d.createdAt)
  if (own.length === 0) return null
  return own.reduce((latest, d) => (d.createdAt > latest.createdAt ? d : latest))
}

// Turns a past donation back into form values. The business still checks them and taps "Publiko".
function formFromDonation(donation) {
  const estimated = estimateKg(donation.foodType, donation.portions)
  return {
    foodType: donation.foodType,
    portions: donation.portions,
    deadlineMinutes: closestDeadline((donation.pickupDeadline - donation.createdAt) / MINUTE),
    storage: donation.storage,
    allergens: donation.allergens,
    kgOverride: donation.kg !== estimated ? String(donation.kg) : null, // keep a weight they typed
    note: donation.note ?? '',
  }
}

function RepeatLastCard({ donation, onRepeat }) {
  const foodType = FOOD_TYPES[donation.foodType]
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream-50 p-3 ring-1 ring-cream-100">
      <FoodIcon foodType={donation.foodType} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-crust-700 uppercase">Si herën e kaluar?</p>
        <p className="truncate font-semibold text-brand-900">
          {foodType.label} · {donation.portions} porcione
        </p>
        <p className="truncate text-xs text-ink/60">{STORAGE_TYPES[donation.storage].label}</p>
      </div>
      <button
        type="button"
        onClick={onRepeat}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-700 px-3 text-sm font-semibold text-white active:scale-95"
      >
        <RotateCcw className="size-4" />
        Plotëso
      </button>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink/60 uppercase">{title}</h2>
      {children}
    </div>
  )
}

function PublishPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [published, setPublished] = useState(null) // { donation, seconds } after publishing
  const lastDonation = findLastDonation(useDonations())

  // Copies the form object and changes one field. React needs a NEW object to notice the change.
  function updateField(name, value) {
    setForm({ ...form, [name]: value })
  }

  // "Asnjë" (none) and real allergens exclude each other.
  function toggleAllergen(allergen) {
    let next
    if (allergen === 'none') {
      next = form.allergens.includes('none') ? [] : ['none']
    } else if (form.allergens.includes(allergen)) {
      next = form.allergens.filter((a) => a !== allergen)
    } else {
      next = [...form.allergens.filter((a) => a !== 'none'), allergen]
    }
    updateField('allergens', next)
  }

  const estimatedKg = form.foodType ? estimateKg(form.foodType, form.portions) : null
  const customKg = Number(form.kgOverride)
  const kg = customKg > 0 ? customKg : estimatedKg

  const missing = []
  if (!form.foodType) missing.push('llojin')
  if (!form.storage) missing.push('ruajtjen')
  if (form.allergens.length === 0) missing.push('alergjenët')

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (missing.length > 0) return

    const donation = addDonation({
      businessId: DEMO_BUSINESS.id,
      businessName: DEMO_BUSINESS.name,
      address: DEMO_BUSINESS.address,
      lat: DEMO_BUSINESS.lat,
      lng: DEMO_BUSINESS.lng,
      foodType: form.foodType,
      portions: form.portions,
      kg,
      storage: form.storage,
      allergens: form.allergens,
      note: form.note.trim(),
      pickupDeadline: Date.now() + form.deadlineMinutes * MINUTE,
    })
    setPublished({ donation, seconds: Math.round((Date.now() - startedAt) / 1000) })
  }

  function publishAnother() {
    setForm(EMPTY_FORM)
    setStartedAt(Date.now())
    setPublished(null)
  }

  if (published) {
    return <PublishSuccess {...published} onPublishAnother={publishAnother} />
  }

  return (
    // Tablet/computer: a centered column, wider than on the phone
    <form onSubmit={handleSubmit} className="flex flex-col gap-7 p-4 md:mx-auto md:w-full md:max-w-2xl md:p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-900">Publiko ushqimin</h1>
        <p className="mt-1 text-sm text-ink/70">
          <InlineIcon Icon={Store} />
          {DEMO_BUSINESS.name} · {DEMO_BUSINESS.address}
        </p>
      </div>

      {/* Only on an untouched form: once they start choosing, the card would just be in the way. */}
      {lastDonation && form === EMPTY_FORM && (
        <RepeatLastCard donation={lastDonation} onRepeat={() => setForm(formFromDonation(lastDonation))} />
      )}

      <FormSection title="Çfarë ushqimi?">
        <ChipGroup
          options={toOptions(FOOD_TYPES)}
          value={form.foodType}
          onChange={(value) => updateField('foodType', value)}
        />
      </FormSection>

      <FormSection title="Sa porcione?">
        <NumberStepper
          value={form.portions}
          onChange={(value) => updateField('portions', value)}
          max={MAX_PORTIONS}
          decreaseLabel="Më pak porcione"
          increaseLabel="Më shumë porcione"
        />
        <div className="mt-3">
          <ChipGroup
            options={PORTION_PRESETS}
            value={form.portions}
            onChange={(value) => updateField('portions', value)}
          />
        </div>
      </FormSection>

      <FormSection title="Deri kur merret?">
        <ChipGroup
          options={DEADLINE_OPTIONS}
          value={form.deadlineMinutes}
          onChange={(value) => updateField('deadlineMinutes', value)}
        />
        <p className="mt-2 text-sm font-semibold text-brand-700">
          <InlineIcon Icon={Clock} />
          Deri në {formatClock(Date.now() + form.deadlineMinutes * MINUTE)}
        </p>
      </FormSection>

      <FormSection title="Si ruhet?">
        <ChipGroup
          options={toOptions(STORAGE_TYPES)}
          value={form.storage}
          onChange={(value) => updateField('storage', value)}
        />
      </FormSection>

      <FormSection title="Alergjenët (të detyrueshëm)">
        <div className="flex flex-wrap gap-2">
          {Object.entries(ALLERGENS).map(([value, label]) => {
            const selected = form.allergens.includes(value)
            return (
              <Chip
                key={value}
                selected={selected}
                onClick={() => toggleAllergen(value)}
                Icon={value === 'none' && selected ? Check : null}
              >
                {label}
              </Chip>
            )
          })}
        </div>
      </FormSection>

      {estimatedKg !== null && (
        <FormSection title="Pesha">
          {form.kgOverride === null ? (
            <div className="flex items-center justify-between rounded-2xl bg-cream-50 p-4 ring-1 ring-cream-100">
              <span>
                ≈ <strong className="text-lg">{formatKg(estimatedKg)} kg</strong>{' '}
                <span className="text-sm text-ink/60">(vlerësim)</span>
              </span>
              <button
                type="button"
                onClick={() => updateField('kgOverride', String(estimatedKg))}
                className="px-2 py-2 font-semibold text-brand-700 underline"
              >
                Ndrysho
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={form.kgOverride}
                onChange={(event) => updateField('kgOverride', event.target.value)}
                aria-label="Pesha në kilogramë"
                className="h-14 w-28 rounded-2xl bg-card px-4 text-xl font-semibold ring-1 ring-brand-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <span className="font-semibold">kg</span>
              <button
                type="button"
                onClick={() => updateField('kgOverride', null)}
                className="ml-auto px-2 py-2 text-sm font-semibold text-brand-700 underline"
              >
                Përdor vlerësimin
              </button>
            </div>
          )}
        </FormSection>
      )}

      <FormSection title="Shënim (opsional)">
        <textarea
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
          rows={2}
          maxLength={200}
          placeholder="P.sh. hyrja nga pas, sillni enë"
          className="w-full rounded-2xl bg-card p-4 ring-1 ring-brand-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </FormSection>

      {/* Phone/tablet: stays visible above the bottom navigation while scrolling.
          The gradient background fades out the content scrolling underneath.
          Computer: a normal button at the end of the form (no bottom navigation there). */}
      <div className="sticky bottom-16 -mx-4 bg-linear-to-t from-surface from-70% to-surface/0 px-4 pt-8 pb-4 md:-mx-6 md:px-6 lg:static lg:mx-0 lg:bg-none lg:px-0 lg:pt-0 lg:pb-0">
        <BigButton type="submit" disabled={missing.length > 0}>
          {missing.length > 0 ? `Zgjidh: ${missing.join(', ')}` : 'Publiko ushqimin'}
        </BigButton>
      </div>
    </form>
  )
}

function PublishSuccess({ donation, seconds, onPublishAnother }) {
  const navigate = useNavigate()
  const foodType = FOOD_TYPES[donation.foodType]

  return (
    <section className="flex flex-col items-center gap-4 p-6 pt-12 text-center md:mx-auto md:max-w-md">
      <span className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Check className="size-12" strokeWidth={2.5} />
      </span>
      <h1 className="font-display text-3xl font-semibold text-brand-900">U publikua!</h1>
      <p className="text-lg">
        <InlineIcon Icon={foodType.Icon} className="text-crust-700" />
        {foodType.label} · {donation.portions} porcione
        <br />
        <span className="text-ink/70">deri në {formatClock(donation.pickupDeadline)}</span>
      </p>
      <p className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
        <InlineIcon Icon={Timer} />
        Gati për {seconds} sekonda
      </p>
      <p className="text-ink/70">Organizatat dhe vullnetarët e shohin tani.</p>

      <div className="mt-4 flex w-full flex-col gap-3">
        <BigButton onClick={onPublishAnother}>Publiko tjetër</BigButton>
        <BigButton variant="secondary" onClick={() => navigate('/my-donations')}>
          Donacionet e mia
        </BigButton>
      </div>
    </section>
  )
}

export default PublishPage
