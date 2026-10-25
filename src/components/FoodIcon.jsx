import { FOOD_TYPES } from '../lib/constants.js'

// [box size, icon size] for each size name
const SIZES = {
  sm: ['size-10 rounded-xl', 'size-5'],
  md: ['size-12 rounded-2xl', 'size-6'],
  lg: ['size-14 rounded-2xl', 'size-7'],
  xl: ['size-16 rounded-2xl', 'size-8'],
}

// The food type icon in a warm cream square, used on cards, rows and details.
function FoodIcon({ foodType, size = 'md' }) {
  const { Icon } = FOOD_TYPES[foodType]
  const [boxClass, iconClass] = SIZES[size]
  return (
    <span className={`flex shrink-0 items-center justify-center bg-cream-50 text-crust-700 ${boxClass}`}>
      <Icon className={iconClass} />
    </span>
  )
}

export default FoodIcon
