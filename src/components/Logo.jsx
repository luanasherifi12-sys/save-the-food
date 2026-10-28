// The Save the Food mark: a green map pin with an ear of wheat (same drawing as public/favicon.svg).
// `onDark` adds a light ring so the green pin stands out on the dark green header.
function Logo({ className = 'size-7', onDark = false }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 2C19.3 2 9 12.1 9 24.6 9 41.5 32 62 32 62s23-20.5 23-37.4C55 12.1 44.7 2 32 2z"
        fill={onDark ? '#2f9e5f' : '#1b5e20'}
      />
      <g fill="#ffffff">
        <rect x="30.6" y="20" width="2.8" height="25" rx="1.4" />
        <ellipse cx="32" cy="14.5" rx="2.6" ry="4.4" />
        <ellipse cx="28.4" cy="22" rx="2.4" ry="4.3" transform="rotate(-35 28.4 22)" />
        <ellipse cx="35.6" cy="22" rx="2.4" ry="4.3" transform="rotate(35 35.6 22)" />
        <ellipse cx="28.4" cy="29" rx="2.4" ry="4.3" transform="rotate(-35 28.4 29)" />
        <ellipse cx="35.6" cy="29" rx="2.4" ry="4.3" transform="rotate(35 35.6 29)" />
        <ellipse cx="28.4" cy="36" rx="2.4" ry="4.3" transform="rotate(-35 28.4 36)" />
        <ellipse cx="35.6" cy="36" rx="2.4" ry="4.3" transform="rotate(35 35.6 36)" />
      </g>
    </svg>
  )
}

export default Logo
