type DiffBadgeProps = {
  value: number
  unit?: string
  goodDirection?: 'up' | 'down'
}

const formatValue = (value: number, unit: string) => {
  const sign = value > 0 ? '+' : ''
  const formatted = Math.abs(value) < 1 ? value.toFixed(2) : value.toFixed(0)
  return `${sign}${formatted}${unit}`
}

export const DiffBadge = ({ value, unit = '', goodDirection = 'up' }: DiffBadgeProps) => {
  const isGood = goodDirection === 'up' ? value > 0 : value < 0
  const isNeutral = Math.abs(value) < 0.01

  const colorClass = isNeutral
    ? 'bg-slate-100 text-slate-500 border-slate-200'
    : isGood
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-red-100 text-red-700 border-red-200'

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${colorClass}`}>
      {isNeutral ? 'unchanged' : formatValue(value, unit)}
    </span>
  )
}
