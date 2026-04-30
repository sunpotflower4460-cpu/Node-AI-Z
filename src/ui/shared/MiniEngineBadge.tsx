import { Zap } from 'lucide-react'
import type { OverviewMode } from '../mode/modeUiTypes'
import { getEngineLabel } from '../mode/engineLabelMap'

type MiniEngineBadgeProps = {
  mode: OverviewMode
}

export const MiniEngineBadge = ({ mode }: MiniEngineBadgeProps) => {
  const label = getEngineLabel(mode)

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm">
      <Zap className="h-3 w-3 text-amber-400" />
      {label.short}
    </span>
  )
}
