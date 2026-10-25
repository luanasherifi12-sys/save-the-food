// A small icon that sits inside a line of text, like an emoji would: <p><InlineIcon Icon={Users} />12 persona</p>
// It takes the text color and is aligned with the letters.
function InlineIcon({ Icon, className = '' }) {
  return <Icon className={`mr-1.5 inline-block size-[1.1em] shrink-0 align-[-0.2em] ${className}`} />
}

export default InlineIcon
