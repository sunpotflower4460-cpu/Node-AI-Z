import { RefreshCcw, Database, TrendingUp, AlertTriangle, Lock } from 'lucide-react'
import type { RevisionState, RevisionEntry, UserTuningAction } from '../../revision/revisionTypes'
import { getRevisionSummary } from '../../revision/getRevisionSummary'
import { describeProposedChange, formatRevisionDelta, getRevisionStatusMeta } from '../../revision/statusMeta'
import { TabHeader, Badge } from '../components/CommonUI'
import { SelfRevisionCard } from '../components/SelfRevisionCard'

type RevisionTabProps = {
  revisionState: RevisionState
  currentEntry: RevisionEntry | null
  onTuningAction: (entryId: string, changeId: string, action: UserTuningAction) => void
  onClearAll?: () => void
}

export const RevisionTab = ({ revisionState, currentEntry, onTuningAction, onClearAll }: RevisionTabProps) => {
  const summary = getRevisionSummary(revisionState)

  const handleTuningAction = (changeId: string, action: UserTuningAction) => {
    if (currentEntry) {
      onTuningAction(currentEntry.id, changeId, action)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Revision"
        description="Self-revision layer: track divergences and propose improvements"
        icon={RefreshCcw}
        colorClass="border-indigo-100 text-indigo-900"
      />

      {/* Summary Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" /> Memory Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total</div>
            <div className="text-2xl font-bold text-slate-800">{summary.totalEntries}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{getRevisionStatusMeta('ephemeral').label}</div>
            <div className="text-2xl font-bold text-slate-600">{summary.ephemeralCount}</div>
            <div className="mt-1 text-[11px] font-medium text-slate-400">{getRevisionStatusMeta('ephemeral').description}</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="text-[10px] font-bold text-yellow-600 uppercase mb-1">{getRevisionStatusMeta('provisional').label}</div>
            <div className="text-2xl font-bold text-yellow-700">{summary.provisionalCount}</div>
            <div className="mt-1 text-[11px] font-medium text-yellow-700/70">{getRevisionStatusMeta('provisional').description}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-[10px] font-bold text-green-600 uppercase mb-1">{getRevisionStatusMeta('promoted').label}</div>
            <div className="text-2xl font-bold text-green-700">{summary.promotedCount}</div>
            <div className="mt-1 text-[11px] font-medium text-green-700/70">{getRevisionStatusMeta('promoted').description}</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="text-[10px] font-bold text-red-600 uppercase mb-1">{getRevisionStatusMeta('reverted').label}</div>
            <div className="text-2xl font-bold text-red-700">{summary.revertedCount}</div>
            <div className="mt-1 text-[11px] font-medium text-red-700/70">{getRevisionStatusMeta('reverted').description}</div>
          </div>
        </div>
      </div>

      {/* Top Issues */}
      {summary.topIssues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Top Issues
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.topIssues.map((issue, index) => (
              <div key={index} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800">{issue.tag}</span>
                  <Badge colorClass="bg-amber-100 text-amber-700 border-amber-300">×{issue.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Entry */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-200 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Current Interaction
        </h3>
        <SelfRevisionCard entry={currentEntry} tuning={revisionState.tuning} onTuningAction={handleTuningAction} />
      </div>

      {/* Recent Changes */}
      {summary.recentChanges.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <RefreshCcw className="w-3.5 h-3.5" /> Recent Changes
            </h3>
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-2">
            {summary.recentChanges.slice(0, 5).map((change) => {
              const isLocked = revisionState.tuning.locked.has(change.id)
              const isKept = revisionState.tuning.kept.has(change.id)
              const isSoftened = revisionState.tuning.softened.has(change.id)
              const isReverted = revisionState.tuning.reverted.has(change.id)

              return (
                <div key={change.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge colorClass="bg-indigo-100 text-indigo-700 border-indigo-200">
                          {change.kind}
                        </Badge>
                        <span className="text-xs font-mono text-slate-600">{change.key}</span>
                        <Badge colorClass={getRevisionStatusMeta(change.status).badgeClass}>
                          {getRevisionStatusMeta(change.status).label}
                        </Badge>
                        {isLocked && (
                          <Badge colorClass="bg-indigo-100 text-indigo-700 border-indigo-200 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> locked
                          </Badge>
                        )}
                        {isKept && !isLocked && (
                          <Badge colorClass="bg-green-100 text-green-700 border-green-200">kept</Badge>
                        )}
                        {isSoftened && (
                          <Badge colorClass="bg-yellow-100 text-yellow-700 border-yellow-200">softened</Badge>
                        )}
                        {isReverted && (
                          <Badge colorClass="bg-red-100 text-red-700 border-red-200">reverted</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-700">{change.reason}</p>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">{describeProposedChange(change)} / {getRevisionStatusMeta(change.status).description}</p>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {formatRevisionDelta(change.delta)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Entries List */}
      {revisionState.memory.entries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">All Revision Entries</h3>
          <div className="space-y-2">
            {revisionState.memory.entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-700 mb-1">"{entry.inputText.substring(0, 60)}..."</div>
                    <div className="text-[11px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</div>
                  </div>
                  <Badge colorClass={getRevisionStatusMeta(entry.status).badgeClass}>
                    {getRevisionStatusMeta(entry.status).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{entry.proposedChanges.length} changes</span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-500">{entry.issueTags.length} issues</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-slate-500">{getRevisionStatusMeta(entry.status).description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {revisionState.memory.entries.length === 0 && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
          <RefreshCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">No revision entries yet. Interact with the system to build revision history.</p>
        </div>
      )}
    </div>
  )
}
