import { STATUSES } from '../lib/constants.js'

const STATUS_STYLES = {
  published: 'bg-brand-50 text-brand-900',
  reserved: 'bg-cream-100 text-crust-700',
  picked_up: 'bg-brand-100 text-brand-900',
  distributed: 'bg-brand-700 text-white',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[status]}`}>
      {STATUSES[status].label}
    </span>
  )
}

export default StatusBadge
