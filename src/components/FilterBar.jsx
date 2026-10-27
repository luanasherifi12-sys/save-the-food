import { ChevronDown, ChevronUp, SlidersHorizontal, Zap } from 'lucide-react'
import { useState } from 'react'
import ChipGroup from './ChipGroup.jsx'
import { FOOD_TYPES, toOptions } from '../lib/constants.js'

export const DEFAULT_FILTERS = { foodType: 'all', maxKm: 'all', urgency: 'all' }

const FOOD_OPTIONS = [{ value: 'all', label: 'Të gjitha' }, ...toOptions(FOOD_TYPES)]
const DISTANCE_OPTIONS = [
  { value: 'all', label: 'Çdo distancë' },
  { value: 1, label: 'Deri 1 km' },
  { value: 3, label: 'Deri 3 km' },
  { value: 5, label: 'Deri 5 km' },
]
const URGENCY_OPTIONS = [
  { value: 'all', label: 'Të gjitha' },
  { value: 'urgent', label: 'Vetëm urgjente', Icon: Zap },
]

// "Filtra" button that opens a panel with chip groups.
// Whether the panel is open is only needed here, so that state lives here (not in the page).
function FilterBar({ filters, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const activeCount = Object.values(filters).filter((value) => value !== 'all').length

  function updateFilter(name, value) {
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl font-semibold ring-1 ${
            activeCount > 0 ? 'bg-brand-50 text-brand-900 ring-brand-500' : 'bg-card text-ink ring-brand-100'
          }`}
        >
          <SlidersHorizontal className="size-5" />
          Filtra{activeCount > 0 && ` (${activeCount})`}
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="h-11 rounded-2xl bg-card px-4 text-sm font-semibold text-brand-700 ring-1 ring-brand-100"
          >
            Pastro
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 flex flex-col gap-4 rounded-3xl bg-card p-4 ring-1 ring-brand-100">
          <FilterGroup title="Lloji">
            <ChipGroup
              options={FOOD_OPTIONS}
              value={filters.foodType}
              onChange={(value) => updateFilter('foodType', value)}
            />
          </FilterGroup>
          <FilterGroup title="Distanca">
            <ChipGroup
              options={DISTANCE_OPTIONS}
              value={filters.maxKm}
              onChange={(value) => updateFilter('maxKm', value)}
            />
          </FilterGroup>
          <FilterGroup title="Urgjenca">
            <ChipGroup
              options={URGENCY_OPTIONS}
              value={filters.urgency}
              onChange={(value) => updateFilter('urgency', value)}
            />
          </FilterGroup>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-12 rounded-2xl bg-brand-700 font-semibold text-white"
          >
            Gati
          </button>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-ink/60 uppercase">{title}</h2>
      {children}
    </div>
  )
}

export default FilterBar
