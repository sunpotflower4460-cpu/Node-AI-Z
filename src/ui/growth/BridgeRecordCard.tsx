import type { GrowthBridgeRecord } from './buildGrowthViewModel'
import { StageBadge } from '../shared/StageBadge'
import { ScoreBar } from '../shared/ScoreBar'
import { EmptyState } from '../shared/EmptyState'

type BridgeRecordCardProps = {
  records: GrowthBridgeRecord[]
  researchMode?: boolean
}

export const BridgeRecordCard = ({ records, researchMode = false }: BridgeRecordCardProps) => {
  if (records.length === 0) {
    return (
      <EmptyState
        title="teacher-free bridge はまだありません。"
        description="まず teacher-assisted bridge が想起に成功すると、teacher_light / teacher_free へ進みます。"
      />
    )
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <article
          key={record.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <StageBadge stage={record.stage} />
            {researchMode && (
              <span className="text-[10px] font-mono text-slate-400">{record.id}</span>
            )}
          </div>

          <div className="space-y-2">
            <ScoreBar
              label="Teacher Dependency"
              value={record.teacherDependencyScore}
              colorClass={record.teacherDependencyScore > 0.6 ? 'bg-purple-500' : 'bg-emerald-400'}
            />
            <ScoreBar
              label="Recall Success"
              value={record.recallSuccessScore}
              colorClass="bg-indigo-500"
            />
          </div>

          {researchMode && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-500">
              <div>
                <span className="font-bold text-slate-700">{record.teacherConfirmCount}</span>
                <span className="ml-1">teacher</span>
              </div>
              <div>
                <span className="font-bold text-emerald-700">{record.selfRecallSuccessCount}</span>
                <span className="ml-1">self</span>
              </div>
              <div>
                <span className="font-bold text-red-600">{record.failedRecallCount}</span>
                <span className="ml-1">failed</span>
              </div>
              <div className="col-span-3">
                <span>createdBy: </span>
                <span className="font-bold text-slate-700">{record.createdBy}</span>
                <span className="ml-3">confidence: </span>
                <span className="font-bold text-slate-700">{record.confidence.toFixed(2)}</span>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
