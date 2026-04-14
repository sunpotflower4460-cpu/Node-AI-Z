import { AlertCircle, CheckCircle, MinusCircle, Lock, RefreshCcw } from 'lucide-react'
import type { RevisionEntry, UserTuningAction } from '../../revision/revisionTypes'
import { describeProposedChange, formatRevisionDelta, getRevisionKindLabel, getRevisionStatusMeta } from '../../revision/statusMeta'

type SelfRevisionCardProps = {
  entry: RevisionEntry | null
  onTuningAction?: (changeId: string, action: UserTuningAction) => void
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'promoted': return <CheckCircle className="w-3.5 h-3.5 text-green-600" />
    case 'provisional': return <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
    case 'reverted': return <MinusCircle className="w-3.5 h-3.5 text-red-600" />
    default: return <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
  }
}

export const SelfRevisionCard = ({ entry, onTuningAction }: SelfRevisionCardProps) => {
  if (!entry) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
        <p className="text-sm text-slate-500">No revision data for this interaction yet.</p>
      </div>
    )
  }

  const hasIssues = entry.issueTags.length > 0
  const hasChanges = entry.proposedChanges.length > 0
  const entryStatusMeta = getRevisionStatusMeta(entry.status)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1 flex items-center gap-1.5">
            <RefreshCcw className="w-3.5 h-3.5" /> Self-Revision
          </h3>
          <p className="text-sm text-slate-700 font-medium">{entry.note}</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
            この変化はまだ仮です。次回の推論へごく薄く反映され、あとで keep / soften / revert / lock できます。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(entry.status)}
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{entryStatusMeta.label}</div>
            <div className="text-[11px] font-medium text-slate-400">{entryStatusMeta.description}</div>
          </div>
        </div>
      </div>

      {hasIssues && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2">Issue Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {entry.issueTags.map((tag, index) => (
              <span key={index} className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Proposed Changes ({entry.proposedChanges.length})</h4>
          {entry.proposedChanges.map((change) => (
            <div key={change.id} className={`rounded-lg border p-3 ${getRevisionStatusMeta(change.status).panelClass}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/70 rounded">
                      {getRevisionKindLabel(change.kind)}
                    </span>
                    <span className="text-xs font-mono text-slate-600">{change.key}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getRevisionStatusMeta(change.status).badgeClass}`}>
                      {getRevisionStatusMeta(change.status).label}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{change.reason}</p>
                  <p className="mt-1 text-[11px] font-medium opacity-80">{describeProposedChange(change)}</p>
                </div>
                <div className="text-sm font-bold">
                  {formatRevisionDelta(change.delta)}
                </div>
              </div>

              {onTuningAction && change.status === 'ephemeral' && (
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-current/20">
                  <button
                    onClick={() => onTuningAction(change.id, 'keep')}
                    className="flex-1 px-2 py-1 text-[10px] font-bold rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    title="Keep this change"
                  >
                    Keep
                  </button>
                  <button
                    onClick={() => onTuningAction(change.id, 'soften')}
                    className="flex-1 px-2 py-1 text-[10px] font-bold rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                    title="Apply at 50% strength"
                  >
                    Soften
                  </button>
                  <button
                    onClick={() => onTuningAction(change.id, 'revert')}
                    className="flex-1 px-2 py-1 text-[10px] font-bold rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    title="Discard this change"
                  >
                    Revert
                  </button>
                  <button
                    onClick={() => onTuningAction(change.id, 'lock')}
                    className="px-2 py-1 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors flex items-center gap-1"
                    title="Lock as permanent"
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                </div>
              )}

              {change.status !== 'ephemeral' && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <span className="text-[10px] font-bold tracking-wider opacity-75">
                    {getRevisionStatusMeta(change.status).label} — {getRevisionStatusMeta(change.status).description}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasIssues && !hasChanges && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm text-green-700 font-medium">No improvements needed for this interaction.</p>
        </div>
      )}
    </div>
  )
}
