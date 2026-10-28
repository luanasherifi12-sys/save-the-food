// Reports: which donations fall in a period, and turning them into a CSV file for Excel.
import { ALLERGENS, FOOD_TYPES, STATUSES, STORAGE_TYPES } from './constants.js'
import { startOfDay } from './history.js'
import { formatClock } from './time.js'

const DAY = 24 * 60 * 60 * 1000

export const PERIODS = [
  { value: 'today', label: 'Sot' },
  { value: 'week', label: 'Këtë javë' },
  { value: 'month', label: 'Këtë muaj' },
]

// When the period starts (Monday for the week, the 1st for the month)
export function periodStart(period, now) {
  const today = startOfDay(now)
  if (period === 'today') return today
  if (period === 'week') return today - ((new Date(today).getDay() + 6) % 7) * DAY
  const date = new Date(today)
  date.setDate(1)
  return date.getTime()
}

export function inPeriod(donations, period, now) {
  const start = periodStart(period, now)
  return donations
    .filter((d) => (d.createdAt ?? 0) >= start && (d.createdAt ?? 0) <= now)
    .sort((a, b) => b.createdAt - a.createdAt)
}

// "28.10.2026"
export function formatDate(timestamp) {
  const d = new Date(timestamp)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

// Excel in Albanian/European settings expects ";" between columns and "," in decimals.
function csvCell(value) {
  const text = typeof value === 'number' ? String(value).replace('.', ',') : String(value ?? '')
  return /[";\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(donations) {
  const header = ['Data', 'Ora', 'Biznesi', 'Ushqimi', 'Porcione', 'Kg', 'Ruajtja', 'Alergjenët', 'Statusi', 'Persona të ndihmuar', 'Vlerësimi']
  const rows = donations.map((d) => [
    formatDate(d.createdAt),
    formatClock(d.createdAt),
    d.businessName,
    FOOD_TYPES[d.foodType].label,
    d.portions,
    d.kg,
    STORAGE_TYPES[d.storage].label,
    d.allergens.map((a) => ALLERGENS[a]).join(', '),
    STATUSES[d.status].label,
    d.peopleHelped ?? '',
    d.rating ? `${d.rating.stars}/5` : '',
  ])
  // ﻿ (BOM) at the start tells Excel the file is UTF-8, so ë and ç show correctly
  return '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
}

// Makes the browser download a text file (no server needed)
export function downloadFile(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
