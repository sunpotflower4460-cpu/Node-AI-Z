import type { BridgeStage } from './SignalFieldVisualTheme'
import { SignalFieldVisualTheme } from './SignalFieldVisualTheme'

type BridgeMaturityBadgeProps = {
  stage: BridgeStage
  size?: 'sm' | 'md'
}

const STAGE_CLASS: Record<BridgeStage, string> = {
  tentative: 'bg-slate-800 text-slate-400 border-slate-700',
  reinforced: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  teacher_light: 'bg-purple-950 text-purple-300 border-purple-800',
  teacher_free: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  promoted: 'bg-yellow-950 text-yellow-300 border-yellow-700',
}

export const BridgeMaturityBadge = ({ stage, size = 'md' }: BridgeMaturityBadgeProps) => {
  const label = SignalFieldVisualTheme.bridge[stage]?.label ?? stage
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wide ${sizeClass} ${STAGE_CLASS[stage] ?? STAGE_CLASS.tentative}`}
    >
      {label}
    </span>
  )
}
