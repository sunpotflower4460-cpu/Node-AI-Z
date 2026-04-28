import { useState } from 'react'
import type { TeacherBridgeEntry } from './buildTeacherDependencyViewModel'
import { StageBadge } from '../shared/StageBadge'
import { ScoreBar } from '../shared/ScoreBar'
import { FilterChips } from '../shared/FilterChips'
import { EmptyState } from '../shared/EmptyState'

type BridgeFilter =
  | 'all'
  | 'teacher-assisted'
  | 'teacher-light'
  | 'teacher-free'
  | 'promoted'
  | 'high-dependency'
  | 'low-recall'

const FILTER_LABELS: Partial<Record<BridgeFilter, string>> = {
  'all': 'All',
  'teacher-assisted': 'Teacher-Assisted',
  'teacher-light': 'Teacher-Light',
  'teacher-free': 'Teacher-Free',
  'promoted': 'Promoted',
  'high-dependency': 'High Dependency',
  'low-recall': 'Low Recall',
}

const FILTERS: BridgeFilter[] = [
  'all', 'teacher-assisted', 'teacher-light', 'teacher-free', 'promoted', 'high-dependency', 'low-recall',
]

const filterBridges = (bridges: TeacherBridgeEntry[], filter: BridgeFilter): TeacherBridgeEntry[] => {
  switch (filter) {
    case 'all': return bridges
    case 'teacher-assisted': return bridges.filter((b) => b.stage === 'tentative' || b.stage === 'reinforced')
    case 'teacher-light': return bridges.filter((b) => b.stage === 'teacher_light')
    case 'teacher-free': return bridges.filter((b) => b.stage === 'teacher_free')
    case 'promoted': return bridges.filter((b) => b.stage === 'promoted')
    case 'high-dependency': return bridges.filter((b) => b.teacherDependencyScore > 0.6)
    case 'low-recall': return bridges.filter((b) => b.recallSuccessScore < 0.4)
    default: return bridges
  }
}

type TeacherBridgeListProps = {
  bridges: TeacherBridgeEntry[]
  researchMode?: boolean
}

export const TeacherBridgeList = ({ bridges, researchMode = false }: TeacherBridgeListProps) => {
  const [filter, setFilter] = useState<BridgeFilter>('all')

  const filtered = filterBridges(bridges, filter)

  return (
    <div className="flex flex-col gap-3">
      <FilterChips
        options={FILTERS}
        selected={filter}
        labelMap={FILTER_LABELS}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="表示できる bridge がありません。"
          description="このフィルターに該当する bridge はまだ存在しません。"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((bridge) => (
            <div
              key={bridge.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <StageBadge stage={bridge.stage} />
                {researchMode && (
                  <span className="text-[10px] font-mono text-slate-400">{bridge.id}</span>
                )}
              </div>
              <div className="space-y-2">
                <ScoreBar
                  label="Teacher Dependency"
                  value={bridge.teacherDependencyScore}
                  colorClass={bridge.teacherDependencyScore > 0.6 ? 'bg-purple-500' : 'bg-emerald-400'}
                />
                <ScoreBar
                  label="Recall Success"
                  value={bridge.recallSuccessScore}
                  colorClass="bg-indigo-500"
                />
              </div>
              {researchMode && (
                <div className="mt-2 flex gap-3 text-[10px] text-slate-500">
                  <span>createdBy: <span className="font-bold text-slate-700">{bridge.createdBy}</span></span>
                  <span>confidence: <span className="font-bold text-slate-700">{bridge.confidence.toFixed(2)}</span></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
