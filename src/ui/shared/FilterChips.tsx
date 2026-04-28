type FilterChipsProps<T extends string> = {
  options: T[]
  selected: T
  labelMap?: Partial<Record<T, string>>
  onChange: (value: T) => void
}

export const FilterChips = <T extends string>({ options, selected, labelMap, onChange }: FilterChipsProps<T>) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
          selected === option
            ? 'border-indigo-400 bg-indigo-100 text-indigo-700'
            : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {labelMap?.[option] ?? option}
      </button>
    ))}
  </div>
)
