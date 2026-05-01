import { Zap } from 'lucide-react'

type ExperienceEngineStatusProps = {
  engineLabel: string
  researchMode?: boolean
  runtimeModeLabel?: string
  surfaceProviderLabel?: string
}

export const ExperienceEngineStatus = ({
  engineLabel,
  researchMode = false,
  runtimeModeLabel,
  surfaceProviderLabel,
}: ExperienceEngineStatusProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-sm">
      <Zap className="h-3 w-3 text-amber-500" />
      <span>使用中: {engineLabel}</span>
    </div>
    {researchMode && runtimeModeLabel ? (
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
        Runtime: {runtimeModeLabel}
      </div>
    ) : null}
    {researchMode && surfaceProviderLabel ? (
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
        Surface: {surfaceProviderLabel}
      </div>
    ) : null}
  </div>
)
