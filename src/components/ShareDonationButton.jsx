import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { FOOD_TYPES } from '../lib/constants.js'
import { formatClock } from '../lib/time.js'

// Lets an organization send a donation to its volunteers (WhatsApp, Viber, SMS...).
// Phones open their own share menu (Web Share API). Computers copy the text and link instead.
function ShareDonationButton({ donation }) {
  const [copied, setCopied] = useState(false)

  const url = `${window.location.origin}/donations/${donation.id}`
  const text =
    `${FOOD_TYPES[donation.foodType].label} · ${donation.portions} porcione te ` +
    `${donation.businessName} (${donation.address}). Merre deri në ${formatClock(donation.pickupDeadline)}.`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Save the Food', text, url })
      } catch {
        // The person closed the share menu: nothing to do.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard blocked: fall back to a WhatsApp link, which works on every computer.
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener')
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-brand-700 ring-1 ring-brand-100 transition hover:ring-brand-500 active:scale-[0.98]"
    >
      {copied ? <Check className="size-5" /> : <Share2 className="size-5" />}
      {/* aria-live: screen readers announce "Linku u kopjua" when it changes */}
      <span aria-live="polite">{copied ? 'Linku u kopjua' : 'Ndaje këtë ushqim'}</span>
    </button>
  )
}

export default ShareDonationButton
