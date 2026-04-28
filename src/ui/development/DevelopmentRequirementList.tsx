import { CheckCircle2, Circle } from 'lucide-react'
import type { SignalOverviewViewModel } from '../overview/buildSignalOverviewViewModel'

type DevelopmentRequirementListProps = {
  requirements: SignalOverviewViewModel['development']['requirements']
  researchMode?: boolean
}

export const DevelopmentRequirementList = ({ requirements, researchMode = false }: DevelopmentRequirementListProps) => {
  if (requirements.length === 0) {
    return <p className="text-sm text-slate-400">このモードでは詳細 requirement はまだありません。</p>
  }

  return (
    <ul className="space-y-2">
      {requirements.map((requirement) => (
        <li key={requirement.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
          <div className="flex items-start gap-2">
            {requirement.satisfied ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{requirement.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                {requirement.currentValue.toFixed(2)} / {requirement.requiredValue.toFixed(2)}
              </p>
              {researchMode && requirement.notes.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-400">
                  {requirement.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
