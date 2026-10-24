import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BigButton from '../components/BigButton.jsx'
import Chip from '../components/Chip.jsx'
import ChipGroup from '../components/ChipGroup.jsx'
import NumberStepper from '../components/NumberStepper.jsx'
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-7 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Publiko ushqimin</h1>
        <p className="mt-1 text-sm text-ink/70">
          🏪 {DEMO_BUSINESS.name} · {DEMO_BUSINESS.address}
        </p>
      </div>

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
          ⏰ Deri në {formatClock(Date.now() + form.deadlineMinutes * MINUTE)}
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
                icon={value === 'none' && selected ? '✓' : null}
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
                className="h-14 w-28 rounded-2xl bg-white px-4 text-xl font-semibold ring-1 ring-brand-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
          className="w-full rounded-2xl bg-white p-4 ring-1 ring-brand-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </FormSection>

      {/* Stays visible above the bottom navigation while scrolling.
          The gradient background fades out the content scrolling underneath. */}
      <div className="sticky bottom-16 -mx-4 bg-linear-to-t from-surface from-70% to-surface/0 px-4 pt-8 pb-4">
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
    <section className="flex flex-col items-center gap-4 p-6 pt-12 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-5xl text-brand-700">
        ✓
      </span>
      <h1 className="font-display text-3xl font-bold text-brand-900">U publikua!</h1>
      <p className="text-lg">
        {foodType.icon} {foodType.label} · {donation.portions} porcione
        <br />
        <span className="text-ink/70">deri në {formatClock(donation.pickupDeadline)}</span>
      </p>
      <p className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
        ⏱ Gati për {seconds} sekonda
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
