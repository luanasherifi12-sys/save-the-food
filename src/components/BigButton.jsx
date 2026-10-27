const VARIANTS = {
  primary: 'bg-brand-700 text-white disabled:bg-ink/25',
  secondary: 'bg-card text-brand-700 ring-1 ring-brand-100',
}

// The main action of a screen. Extra props (type, disabled, onClick...) go straight to <button>.
function BigButton({ variant = 'primary', className = '', children, ...buttonProps }) {
  return (
    <button
      type="button"
      className={`h-14 w-full rounded-2xl px-4 text-lg font-semibold transition active:scale-[0.98] disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  )
}

export default BigButton
