import { ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import type { ExperienceMessage } from '../../types/experience'
import type { UserTuningState, UserTuningAction } from '../../types/nodeStudio'
import { describeProposedChange } from '../../revision/statusMeta'
import { BehindTheScenesLink } from './BehindTheScenesLink'
import { buildExperienceResultViewModel } from './buildExperienceResultViewModel'
import type { ObserveTab } from './buildExperienceResultViewModel'

type ExperienceResponseCardProps = {
  message: ExperienceMessage
  engineLabel: string
  tuning?: UserTuningState
  researchMode?: boolean
  onNavigateToObserve?: (tab: ObserveTab) => void
  onTuningAction?: (entryId: string, changeId: string, action: UserTuningAction) => void
}

export const ExperienceResponseCard = ({
  message,
  engineLabel,
  tuning,
  researchMode = false,
  onNavigateToObserve,
  onTuningAction,
}: ExperienceResponseCardProps) => {
  const [revisionExpanded, setRevisionExpanded] = useState(false)
  const viewModel = buildExperienceResultViewModel({ message, engineLabel })

  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-3xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
        <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-slate-800">
          {message.text}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            {viewModel.engineLabel}
          </span>
          {message.runtimeMode === 'signal' ? (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
              Signal
            </span>
          ) : null}
          {researchMode && message.observationId ? (
            <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-400">
              obs:{message.observationId.slice(0, 8)}
            </span>
          ) : null}
          <span className="text-xs font-semibold text-slate-400">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {message.revisionEntry && message.revisionEntry.proposedChanges.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-indigo-100 bg-slate-50/80 text-slate-600">
            <button
              type="button"
              onClick={() => setRevisionExpanded((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/60"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                <RefreshCcw className="h-3 w-3" /> Self-Revision
              </span>
              {revisionExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
            {revisionExpanded ? (
              <div className="border-t border-indigo-100 px-3 pb-3 pt-2">
                <p className="text-xs font-medium leading-relaxed text-slate-600">
                  {message.revisionEntry.note}
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {message.revisionEntry.proposedChanges.slice(0, 2).map((change) => {
                    const isReverted = tuning?.reverted.has(change.id) ?? false
                    const isKept = tuning?.kept.has(change.id) ?? false
                    const isSoftened = tuning?.softened.has(change.id) ?? false
                    return (
                      <div key={change.id} className="rounded-xl border border-slate-100 bg-white px-2.5 py-2 shadow-sm">
                        <p className="text-xs font-medium text-slate-700">{describeProposedChange(change)}</p>
                        {onTuningAction && message.revisionEntry ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => onTuningAction(message.revisionEntry!.id, change.id, 'keep')}
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${isKept ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            >
                              keep
                            </button>
                            <button
                              type="button"
                              onClick={() => onTuningAction(message.revisionEntry!.id, change.id, 'soften')}
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${isSoftened ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                            >
                              soften
                            </button>
                            <button
                              type="button"
                              onClick={() => onTuningAction(message.revisionEntry!.id, change.id, 'revert')}
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors ${isReverted ? 'bg-slate-200 text-slate-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              {isReverted ? 'restore' : 'revert'}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {onNavigateToObserve ? (
          <div className="mt-3">
            <BehindTheScenesLink
              internalSummary={viewModel.internalSummary}
              links={viewModel.recommendedObserveLinks}
              onNavigate={onNavigateToObserve}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
