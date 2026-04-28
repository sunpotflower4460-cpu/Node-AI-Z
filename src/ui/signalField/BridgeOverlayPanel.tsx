import type { BridgeViewModel } from './buildSignalFieldViewModel'
import { StageBadge } from '../shared/StageBadge'
import { ScoreBar } from '../shared/ScoreBar'
import { EmptyState } from '../shared/EmptyState'

type BridgeOverlayPanelProps = {
  bridges: BridgeViewModel[]
  researchMode?: boolean
}

export const BridgeOverlayPanel = ({ bridges, researchMode = false }: BridgeOverlayPanelProps) => {
  if (bridges.length === 0) {
    return (
      <EmptyState
        title="teacher-free bridge はまだありません。"
        description="まず teacher-assisted bridge が想起に成功すると、teacher_light / teacher_free へ進みます。"
      />
    )
  }

  return (
    <div className="space-y-2">
      {bridges.map((bridge) => (
        <div
          key={bridge.id}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <StageBadge stage={bridge.stage} />
            {researchMode && (
              <span className="text-[10px] font-mono text-slate-400">{bridge.id}</span>
            )}
          </div>
          <div className="space-y-1.5">
            <ScoreBar
              label="Teacher Dependency"
              value={bridge.teacherDependencyScore}
              colorClass={bridge.teacherDependencyScore > 0.6 ? 'bg-purple-500' : 'bg-emerald-500'}
            />
            <ScoreBar
              label="Recall Success"
              value={bridge.recallSuccessScore}
              colorClass="bg-indigo-500"
            />
          </div>
          {researchMode && (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
              <span>createdBy: <span className="font-bold">{bridge.createdBy}</span></span>
              <span>confidence: <span className="font-bold">{bridge.confidence.toFixed(2)}</span></span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
