import { Bike, Car, Footprints, LocateFixed, LogOut, Monitor, Moon, RotateCcw, Sun } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import BigButton from '../components/BigButton.jsx'
import ChipGroup from '../components/ChipGroup.jsx'
import { SettingsCard, TextField, Toggle } from '../components/FormField.jsx'
import NumberStepper from '../components/NumberStepper.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import { useProfile } from '../hooks/useProfile.js'
import { ROLES } from '../lib/constants.js'
import { resetDonations } from '../lib/donationsStore.js'
import { getTheme, saveProfile, saveTheme } from '../lib/profileStore.js'
import { showToast } from '../lib/toast.js'

// The map code (Leaflet) is only downloaded when this page is opened
const LocationPicker = lazy(() => import('../components/LocationPicker.jsx'))

const NAME_LABELS = {
  business: 'Emri i biznesit',
  organization: 'Emri i organizatës',
  volunteer: 'Emri yt',
}

const RADIUS_OPTIONS = [1, 3, 5, 10].map((km) => ({ value: km, label: `${km} km` }))

const VEHICLE_OPTIONS = [
  { value: 'walk', label: 'Në këmbë', Icon: Footprints },
  { value: 'bike', label: 'Biçikletë', Icon: Bike },
  { value: 'car', label: 'Makinë', Icon: Car },
]

const THEME_OPTIONS = [
  { value: 'system', label: 'Automatike', Icon: Monitor },
  { value: 'light', label: 'E çelët', Icon: Sun },
  { value: 'dark', label: 'E errët', Icon: Moon },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// "Kuzhina e Lagjes" -> "KL": capitalized words first, so small words like "e" are skipped
function initials(name) {
  const words = name.split(/\s+/).filter((word) => /^\p{L}/u.test(word))
  const capitalized = words.filter((word) => /^\p{Lu}/u.test(word))
  return (capitalized.length > 0 ? capitalized : words)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

function ProfilePage() {
  const { role, onChangeRole } = useOutletContext()
  const profile = useProfile(role)
  const [draft, setDraft] = useState(profile) // the form; saved only with "Ruaj ndryshimet"
  const [theme, setTheme] = useState(getTheme)
  const [locating, setLocating] = useState(false)

  const isDirty = JSON.stringify(draft) !== JSON.stringify(profile)

  // Profile changed elsewhere (another tab) and nothing typed here yet -> show the new values
  useEffect(() => {
    if (!isDirty) setDraft(profile)
  }, [profile]) // only when the saved profile changes, not on every keystroke

  function update(name, value) {
    setDraft({ ...draft, [name]: value })
  }

  function updateNotify(name, value) {
    setDraft({ ...draft, notify: { ...draft.notify, [name]: value } })
  }

  const emailError = draft.email && !EMAIL_PATTERN.test(draft.email) ? 'Email-i nuk duket i saktë.' : null
  const canSave = isDirty && draft.name.trim() !== '' && !emailError

  function handleSave(event) {
    event.preventDefault()
    if (!canSave) return
    const { role: _role, ...fields } = draft // `role` is not stored, it comes from the URL/context
    saveProfile(role, { ...fields, name: fields.name.trim() })
    showToast('Profili u ruajt.')
  }

  function locateMe() {
    if (!navigator.geolocation) return showToast('Ky shfletues nuk e jep vendndodhjen.', 'error')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setDraft((current) => ({ ...current, lat: result.coords.latitude, lng: result.coords.longitude }))
        setLocating(false)
      },
      () => {
        setLocating(false)
        showToast('Vendndodhja nuk u mor.', 'error')
      },
      { timeout: 10000 },
    )
  }

  function changeTheme(value) {
    setTheme(value)
    saveTheme(value)
  }

  const currentRole = ROLES[role]

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 p-4 md:mx-auto md:w-full md:max-w-2xl md:p-6">
      {/* ---------- Who ---------- */}
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-header font-display text-2xl font-semibold text-header-soft">
          {initials(profile.name) || <currentRole.Icon className="size-7" />}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-semibold text-brand-900">{profile.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-ink/60">
            <currentRole.Icon className="size-4" /> {currentRole.label}
            {profile.address && ` · ${profile.address}`}
          </p>
        </div>
      </div>

      {/* ---------- Details ---------- */}
      <SettingsCard title="Të dhënat" description="Si të shohin dhe të kontaktojnë të tjerët.">
        <div className="flex flex-col gap-4">
          <TextField
            label={NAME_LABELS[role]}
            value={draft.name}
            onChange={(value) => update('name', value)}
            autoComplete="organization"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Telefoni"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+383 44 123 456"
              value={draft.phone}
              onChange={(value) => update('phone', value)}
            />
            <TextField
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="emri@shembull.com"
              value={draft.email}
              onChange={(value) => update('email', value)}
              hint={emailError}
              aria-invalid={emailError ? true : undefined}
            />
          </div>
        </div>
      </SettingsCard>

      {/* ---------- Location ---------- */}
      <SettingsCard
        title="Vendndodhja"
        description={
          role === 'business'
            ? 'Ku vijnë organizatat për ta marrë ushqimin. Prek hartën ose tërhiq pin-in.'
            : 'Nga ku llogariten distancat dhe njoftimet për ushqim afër.'
        }
      >
        <div className="flex flex-col gap-3">
          <TextField
            label="Adresa ose lagjja"
            value={draft.address}
            onChange={(value) => update('address', value)}
            autoComplete="street-address"
            placeholder="P.sh. Rruga Agim Ramadani 15, Pejton"
          />
          <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-brand-50" />}>
            <LocationPicker
              value={{ lat: draft.lat, lng: draft.lng }}
              onChange={({ lat, lng }) => setDraft((current) => ({ ...current, lat, lng }))}
              className="h-56"
            />
          </Suspense>
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            className="flex h-11 items-center justify-center gap-2 rounded-xl font-semibold text-brand-700 ring-1 ring-brand-100 hover:ring-brand-500 disabled:opacity-60"
          >
            <LocateFixed className="size-4" />
            {locating ? 'Duke kërkuar…' : 'Përdor vendndodhjen time'}
          </button>
        </div>
      </SettingsCard>

      {/* ---------- Role specific ---------- */}
      {role === 'business' && (
        <SettingsCard title="Marrja e ushqimit" description="Ndihmon organizatat të vijnë në kohën e duhur.">
          <div className="flex flex-col gap-4">
            <TextField
              label="Orari"
              value={draft.openingHours}
              onChange={(value) => update('openingHours', value)}
              placeholder="07:00 – 21:00"
            />
            <TextField
              label="Shënim për marrjen (opsional)"
              value={draft.pickupNote}
              onChange={(value) => update('pickupNote', value)}
              placeholder="P.sh. hyrja nga pas, pyesni për Arbenin"
            />
          </div>
        </SettingsCard>
      )}

      {role === 'organization' && (
        <SettingsCard title="Organizata" description="Sa njerëz ushqeni në ditë – që bizneset ta dinë.">
          <p className="mb-2 text-sm font-medium text-ink/80">Persona në ditë</p>
          <NumberStepper
            value={draft.peopleServed}
            onChange={(value) => update('peopleServed', value)}
            max={5000}
            decreaseLabel="Më pak persona"
            increaseLabel="Më shumë persona"
          />
        </SettingsCard>
      )}

      {role === 'volunteer' && (
        <SettingsCard title="Si lëviz" description="Që të të tregojmë ushqim që mund ta marrësh realisht.">
          <ChipGroup options={VEHICLE_OPTIONS} value={draft.vehicle} onChange={(value) => update('vehicle', value)} />
        </SettingsCard>
      )}

      {/* ---------- Notifications ---------- */}
      <SettingsCard title="Njoftimet" description="Shfaqen te zilja lart.">
        <div className="divide-y divide-brand-100">
          {role === 'business' ? (
            <Toggle
              label="Donacionet e mia"
              description="Kur dikush e rezervon, e merr ose e shpërndan ushqimin tënd"
              checked={draft.notify.myDonations}
              onChange={(value) => updateNotify('myDonations', value)}
            />
          ) : (
            <>
              <Toggle
                label="Ushqim urgjent afër"
                description="Kur publikohet ushqim që duhet marrë brenda një ore"
                checked={draft.notify.urgentNearby}
                onChange={(value) => updateNotify('urgentNearby', value)}
              />
              <Toggle
                label="Rezervimet e mia"
                description="Kur rezervimi yt po skadon ose pret shpërndarjen"
                checked={draft.notify.myReservations}
                onChange={(value) => updateNotify('myReservations', value)}
              />
            </>
          )}
        </div>
        {role !== 'business' && (
          <div className="mt-3">
            <p className="mb-2 text-sm font-medium text-ink/80">Rrezja për "afër"</p>
            <ChipGroup
              options={RADIUS_OPTIONS}
              value={draft.radiusKm}
              onChange={(value) => update('radiusKm', value)}
            />
          </div>
        )}
      </SettingsCard>

      {/* ---------- Look ---------- */}
      <SettingsCard title="Pamja" description="Automatike ndjek cilësimin e telefonit ose kompjuterit.">
        <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={changeTheme} />
      </SettingsCard>

      {/* ---------- Other ---------- */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to="/reports"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-card font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100"
        >
          Raportet e mia
        </Link>
        <button
          type="button"
          onClick={() => {
            resetDonations()
            showToast('Të dhënat shembull u rivendosën.')
          }}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-card font-semibold text-ink/70 shadow-sm ring-1 ring-brand-100"
        >
          <RotateCcw className="size-4" /> Rivendos të dhënat demo
        </button>
        <button
          type="button"
          onClick={onChangeRole}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-card font-semibold text-urgent-700 shadow-sm ring-1 ring-brand-100"
        >
          <LogOut className="size-4" /> Ndrysho rolin
        </button>
      </div>

      {/* Save: sticky above the bottom navigation on phones while there are unsaved changes */}
      {isDirty && (
        <div className="sticky bottom-16 -mx-4 bg-linear-to-t from-surface from-70% to-surface/0 px-4 pt-6 pb-4 md:-mx-6 md:px-6 lg:static lg:mx-0 lg:bg-none lg:px-0 lg:pt-0 lg:pb-0">
          <BigButton type="submit" disabled={!canSave}>
            {draft.name.trim() === '' ? 'Shkruaj emrin' : 'Ruaj ndryshimet'}
          </BigButton>
        </div>
      )}
    </form>
  )
}

export default ProfilePage
