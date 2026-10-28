import { Star } from 'lucide-react'
import { useState } from 'react'
import BigButton from './BigButton.jsx'
import Chip from './Chip.jsx'
import { RATING_TAGS } from '../lib/constants.js'

// Read-only stars: ★★★★☆. `label` is what screen readers hear ("4 nga 5 yje").
export function Stars({ value, size = 'size-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} nga 5 yje`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? 'fill-crust-500 text-crust-500' : 'text-ink/25'}`}
        />
      ))}
    </span>
  )
}

const STAR_WORDS = ['', 'Dobët', 'Mjaftueshëm', 'Mirë', 'Shumë mirë', 'Shkëlqyeshëm']

// The organization/volunteer rates the business after distributing the food.
export function RatingForm({ businessName, onSubmit }) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [tags, setTags] = useState([])
  const shown = hovered || stars

  function toggleTag(tag) {
    setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
  }

  return (
    <div className="flex flex-col gap-3 border-t border-brand-100 pt-4">
      <p className="text-center font-semibold text-brand-900">Si ishte me {businessName}?</p>

      {/* radiogroup: arrow keys / Tab + Enter work for keyboard users */}
      <div className="flex justify-center gap-1" role="radiogroup" aria-label="Vlerësimi" onPointerLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} ${n === 1 ? 'yll' : 'yje'}`}
            onClick={() => setStars(n)}
            onPointerEnter={() => setHovered(n)}
            className="flex size-11 items-center justify-center rounded-full transition active:scale-90"
          >
            <Star className={`size-8 transition ${n <= shown ? 'fill-crust-500 text-crust-500' : 'text-ink/25'}`} />
          </button>
        ))}
      </div>
      <p className="h-5 text-center text-sm text-crust-700">{STAR_WORDS[shown]}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {RATING_TAGS.map((tag) => (
          <Chip key={tag} selected={tags.includes(tag)} onClick={() => toggleTag(tag)}>
            {tag}
          </Chip>
        ))}
      </div>

      <BigButton disabled={stars === 0} onClick={() => onSubmit({ stars, tags })}>
        {stars === 0 ? 'Zgjidh yjet' : 'Dërgo vlerësimin'}
      </BigButton>
    </div>
  )
}

// A rating that was already given: stars + tags
export function RatingSummary({ rating, title = 'Vlerësimi' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 border-t border-brand-100 pt-4 text-center">
      <p className="text-xs font-semibold tracking-wide text-ink/50 uppercase">{title}</p>
      <Stars value={rating.stars} size="size-5" />
      {rating.tags.length > 0 && <p className="text-sm text-ink/70">{rating.tags.join(' · ')}</p>}
    </div>
  )
}
