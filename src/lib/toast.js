// Short messages that appear for a few seconds ("U rezervua!").
// Any file can call showToast(); the <Toaster /> component listens and shows them.
// Same idea as the donations store: a tiny event system, no extra library.

const TOAST_EVENT = 'stf:toast'

// kind: 'success' | 'error'
export function showToast(message, kind = 'success') {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { id: crypto.randomUUID(), message, kind } }))
}

export function subscribeToToasts(callback) {
  const handle = (event) => callback(event.detail)
  window.addEventListener(TOAST_EVENT, handle)
  return () => window.removeEventListener(TOAST_EVENT, handle)
}
