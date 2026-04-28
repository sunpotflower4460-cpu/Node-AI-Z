import type { GrowthProtoSeedRecord } from './buildGrowthViewModel'
import { EmptyState } from '../shared/EmptyState'

type ProtoSeedRecordCardProps = {
  records: GrowthProtoSeedRecord[]
  researchMode?: boolean
}

export const ProtoSeedRecordCard = ({ records, researchMode = false }: ProtoSeedRecordCardProps) => {
  if (records.length === 0) {
    return (
      <EmptyState
        title="まだ proto seed は育っていません。"
        description="複数の assembly が繰り返し共鳴すると proto seed として記録されます。"
      />
    )
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <article
          key={record.id}
          className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm"
        >
          {researchMode && (
            <p className="mb-1.5 text-[10px] font-mono text-slate-400">{record.protoSeedId}</p>
          )}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 text-xs text-slate-600">
              <div>recurrence: <span className="font-bold text-slate-800">{record.recurrenceCount}</span></div>
              <div>stability: <span className="font-bold text-amber-700">{Math.round(record.stabilityScore * 100)}%</span></div>
              {researchMode && record.sourceAssemblyIds.length > 0 && (
                <div className="text-[10px] text-slate-400">
                  sources: {record.sourceAssemblyIds.slice(0, 3).join(', ')}{record.sourceAssemblyIds.length > 3 ? '...' : ''}
                </div>
              )}
            </div>
            {record.labelCandidate && (
              <div className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600">候補ラベル (未確定)</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">{record.labelCandidate}</p>
                {record.labelConfidence !== undefined && (
                  <p className="text-[10px] text-slate-400">{Math.round(record.labelConfidence * 100)}% 信頼度</p>
                )}
              </div>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-1.5 rounded-full bg-amber-400"
              style={{ width: `${Math.round(record.stabilityScore * 100)}%` }}
            />
          </div>
        </article>
      ))}
    </div>
  )
}
