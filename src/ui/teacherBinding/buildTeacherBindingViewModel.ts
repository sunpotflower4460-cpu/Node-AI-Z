import type { SameObjectBindingCandidate, TeacherJudgment } from '../../signalTeacher/signalTeacherTypes'
import type { BindingQueueState } from '../../signalTeacher/queue/bindingQueueTypes'
import type { CrossModalRecallResult } from '../../signalRecall/crossModalRecallTypes'
import { buildTeacherSummary } from '../../signalTeacher/buildTeacherSummary'
import { buildBindingQueueSummary } from '../../signalTeacher/queue/buildBindingQueueSummary'
import { buildCrossModalRecallSummary } from '../../signalRecall/buildCrossModalRecallSummary'

export function buildTeacherBindingViewModel(
  candidates: SameObjectBindingCandidate[],
  judgments: TeacherJudgment[],
  queueState: BindingQueueState,
  recallResults: CrossModalRecallResult[],
) {
  const teacherSummary = buildTeacherSummary(candidates, judgments)
  const queueSummary = buildBindingQueueSummary(queueState)
  const recallSummary = buildCrossModalRecallSummary(recallResults)

  const candidateCards = candidates.map(c => ({
    candidate: c,
    judgment: judgments.find(j => j.candidateId === c.id) ?? null,
  }))

  const dependencySummary = {
    avgTeacherDependency: teacherSummary.avgTeacherDependency,
    teacherFreeCount: candidates.filter(c => c.status === 'teacher_free').length,
    notes: teacherSummary.notes,
  }

  return { candidateCards, queueSummary, recallSummary, dependencySummary }
}
