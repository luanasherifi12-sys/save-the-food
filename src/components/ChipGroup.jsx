import Chip from './Chip.jsx'

// A row of chips where exactly one can be selected.
// options: [{ value, label, Icon? }]
function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option.value}
          selected={option.value === value}
          onClick={() => onChange(option.value)}
          Icon={option.Icon}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}

export default ChipGroup
