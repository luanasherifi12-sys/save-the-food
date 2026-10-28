import { CircleAlert, CircleCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { subscribeToToasts } from '../lib/toast.js'

const VISIBLE_MS = 3500

// Shows the messages from showToast() at the bottom of the screen, above the bottom navigation.
// role="status": screen readers read each new message without interrupting.
function Toaster() {
  const [toasts, setToasts] = useState([])

  useEffect(
    () =>
      subscribeToToasts((toast) => {
        setToasts((current) => [...current.slice(-2), toast]) // at most 3 at once
        setTimeout(() => setToasts((current) => current.filter((t) => t.id !== toast.id)), VISIBLE_MS)
      }),
    [],
  )

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[1100] print:hidden flex flex-col items-center gap-2 px-4 lg:bottom-6"
    >
      {toasts.map((toast) => {
        const Icon = toast.kind === 'error' ? CircleAlert : CircleCheck
        return (
          <div
            key={toast.id}
            className="animate-toast-in flex max-w-md items-center gap-2.5 rounded-xl bg-header px-4 py-3 text-sm font-medium text-white shadow-xl"
          >
            <Icon className={`size-5 shrink-0 ${toast.kind === 'error' ? 'text-urgent-500' : 'text-brand-500'}`} />
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}

export default Toaster
