import type { GrowthAssemblyRecord } from './buildGrowthViewModel'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'

type AssemblyRecordCardProps = {
  records: GrowthAssemblyRecord[]
  researchMode?: boolean
}

const getAssemblyBadge = (record: GrowthAssemblyRecord): { label: string; className: string } | null => {
  if (record.isPromotionReady) return { label: 'promotion-ready', className: 'border-amber-300 bg-amber-100 text-amber-700' }
  if (record.stabilityScore > 0.5 && record.replayCount > 0) return { label: 'replaying', className: 'border-blue-300 bg-blue-100 text-blue-700' }
  if (record.stabilityScore > 0.6) return { label: 'stable', className: 'border-emerald-300 bg-emerald-100 text-emerald-700' }
  if (record.recurrenceCount < 2) return { label: 'still-noisy', className: 'border-slate-300 bg-slate-100 text-slate-600' }
  return null
}

export const AssemblyRecordCard = ({ records, researchMode = false }: AssemblyRecordCardProps) => {
  if (records.length === 0) {
    return (
      <EmptyState
        title="まだ assembly は育っていません。"
        description="同じ入力を何度か与えると、反復する発火群が assembly として記録されます。"
      />
    )
  }

  return (
    <div className="space-y-2">
      {records.map((record) => {
        const badge = getAssemblyBadge(record)
        return (
          <article
            key={record.id}
            className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {researchMode && (
                  <p className="mb-1.5 text-[10px] font-mono text-slate-400">{record.assemblyId}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600">
                  <span>recurrence: <span className="font-bold text-slate-800">{record.recurrenceCount}</span></span>
                  <span>replay: <span className="font-bold text-slate-800">{record.replayCount}</span></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {badge && (
                  <StatusBadge className={badge.className}>{badge.label}</StatusBadge>
                )}
                <span className="text-[10px] text-slate-400">
                  stability {Math.round(record.stabilityScore * 100)}%
                </span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-indigo-400"
                style={{ width: `${Math.round(record.stabilityScore * 100)}%` }}
              />
            </div>
            {researchMode && record.sourceHistory.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {record.sourceHistory.map((source) => (
                  <span key={source} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {source}
                  </span>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
