import type { SameObjectBindingCandidate, TeacherJudgment } from '../../signalTeacher/signalTeacherTypes'
import type { BindingQueueState } from '../../signalTeacher/queue/bindingQueueTypes'
import type { CrossModalRecallResult } from '../../signalRecall/crossModalRecallTypes'
import { buildTeacherBindingViewModel } from './buildTeacherBindingViewModel'
import { BindingCandidateCard } from './BindingCandidateCard'
import { TeacherJudgmentCard } from './TeacherJudgmentCard'
import { BindingQueueList } from './BindingQueueList'
import { CrossModalRecallPanel } from './CrossModalRecallPanel'
import { TeacherDependencySummaryCard } from './TeacherDependencySummaryCard'

type Props = {
  candidates: SameObjectBindingCandidate[]
  judgments: TeacherJudgment[]
  queue: BindingQueueState
  recallResults: CrossModalRecallResult[]
  onHumanJudge?: (candidateId: string, choice: 'same' | 'similar_but_different' | 'different' | 'hold') => void
}

export const BindingTeacherPanel = ({ candidates, judgments, queue, recallResults, onHumanJudge }: Props) => {
  const vm = buildTeacherBindingViewModel(candidates, judgments, queue, recallResults)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
        <p className="text-xs text-violet-700 leading-relaxed">
          先生は、画像・言葉・音のあいだに橋をかける補助役です。ただし、先生が一度教えただけでは意味は確定しません。自力で想起できるようになるほど、先生への依存が下がります。
        </p>
      </div>

      <TeacherDependencySummaryCard
        avgTeacherDependency={vm.dependencySummary.avgTeacherDependency}
        teacherFreeCount={vm.dependencySummary.teacherFreeCount}
        notes={vm.dependencySummary.notes}
      />

      {vm.candidateCards.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500">バインディング候補 ({vm.candidateCards.length})</p>
          {vm.candidateCards.map(({ candidate, judgment }) => (
            <div key={candidate.id} className="flex flex-col gap-2">
              <BindingCandidateCard
                candidate={candidate}
                onJudge={onHumanJudge ? (choice) => onHumanJudge(candidate.id, choice) : undefined}
              />
              {judgment && <TeacherJudgmentCard judgment={judgment} />}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500">バインディングキュー</p>
        <BindingQueueList queue={queue} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500">クロスモーダル想起</p>
        <CrossModalRecallPanel results={recallResults} />
      </div>
    </div>
  )
}
