import { STATUSES } from '../lib/constants.js'

const STATUS_STYLES = {
  published: 'bg-brand-50 text-brand-900',
  reserved: 'bg-cream-100 text-crust-700',
  picked_up: 'bg-brand-100 text-brand-900',
  distributed: 'bg-brand-700 text-white',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUSES[status].label}
    </span>
  )
}

export default StatusBadge
