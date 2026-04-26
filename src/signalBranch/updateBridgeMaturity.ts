import type { SignalBridgeRecord } from './signalBranchTypes'
import { computeTeacherDependency } from './computeTeacherDependency'
import { computeRecallSuccess } from './computeRecallSuccess'

/**
 * Update bridge maturity stage based on usage patterns.
 *
 * Stage progression:
 *
 * tentative → reinforced:
 *   - Multiple recurrences (teacherConfirm + selfRecall >= 3)
 *
 * reinforced → teacher_light:
 *   - Self-recall starting to succeed (selfRecallSuccessCount >= 3)
 *   - Teacher dependency decreasing (< 0.4)
 *   - Failed recalls low (<= 1)
 *
 * teacher_light → teacher_free:
 *   - Self-recall highly successful (selfRecallSuccessCount >= 6)
 *   - Teacher dependency very low (< 0.2)
 *   - Recall success high (> 0.75)
 *
 * teacher_free → promoted:
 *   - Teacher-free stage maintained
 *   - High recurrence (total confirmations >= 10)
 *   - High stability (recallSuccessScore > 0.85)
 *   - Bridge is a strong candidate for proto-seed or promoted unit
 */
export function updateBridgeMaturity(record: SignalBridgeRecord): SignalBridgeRecord {
  const teacherDep = computeTeacherDependency(record)
  const recallSuccess = computeRecallSuccess(record)

  const totalConfirmations = record.teacherConfirmCount + record.selfRecallSuccessCount
  const currentStage = record.stage

  let newStage = currentStage

  // Stage transitions
  if (currentStage === 'tentative') {
    if (totalConfirmations >= 3) {
      newStage = 'reinforced'
    }
  } else if (currentStage === 'reinforced') {
    if (
      record.selfRecallSuccessCount >= 3 &&
      record.failedRecallCount <= 1 &&
      teacherDep < 0.4
    ) {
      newStage = 'teacher_light'
    }
  } else if (currentStage === 'teacher_light') {
    if (record.selfRecallSuccessCount >= 6 && teacherDep < 0.2 && recallSuccess > 0.75) {
      newStage = 'teacher_free'
    }
  } else if (currentStage === 'teacher_free') {
    if (totalConfirmations >= 10 && recallSuccess > 0.85) {
      newStage = 'promoted'
    }
  }

  return {
    ...record,
    stage: newStage,
    teacherDependencyScore: teacherDep,
    recallSuccessScore: recallSuccess,
  }
}
