type BridgeStage = 'tentative' | 'reinforced' | 'teacher_light' | 'teacher_free' | 'promoted'

const STAGE_STYLE: Record<BridgeStage, { label: string; className: string }> = {
  tentative: { label: 'tentative', className: 'border-slate-300 bg-slate-100 text-slate-600' },
  reinforced: { label: 'reinforced', className: 'border-indigo-200 bg-indigo-100 text-indigo-700' },
  teacher_light: { label: 'teacher_light', className: 'border-violet-200 bg-violet-100 text-violet-700' },
  teacher_free: { label: 'teacher_free', className: 'border-emerald-300 bg-emerald-100 text-emerald-700' },
  promoted: { label: 'promoted', className: 'border-amber-300 bg-amber-100 text-amber-700' },
}

type StageBadgeProps = {
  stage: string
}

export const StageBadge = ({ stage }: StageBadgeProps) => {
  const style = STAGE_STYLE[stage as BridgeStage] ?? { label: stage, className: 'border-slate-200 bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${style.className}`}>
      {style.label}
    </span>
  )
}
