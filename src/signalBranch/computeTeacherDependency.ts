import type { SignalBridgeRecord } from './signalBranchTypes'

/**
 * Compute how much a bridge depends on the binding teacher.
 *
 * High dependency (close to 1.0):
 * - Many teacher confirmations
 * - Few self-recall successes
 * - Cannot recall without teacher assistance
 *
 * Low dependency (close to 0.0):
 * - Many self-recall successes
 * - Few failed recalls
 * - Can reliably recall without teacher
 *
 * @returns Score from 0.0 (teacher-free) to 1.0 (fully teacher-dependent)
 */
export function computeTeacherDependency(record: SignalBridgeRecord): number {
  const totalAttempts =
    record.teacherConfirmCount + record.selfRecallSuccessCount + record.failedRecallCount

  if (totalAttempts === 0) {
    // No history yet - assume initial dependency based on creation
    return record.createdBy === 'binding_teacher' ? 1.0 : 0.0
  }

  // Teacher ratio: what proportion of successes came from teacher?
  const teacherRatio = record.teacherConfirmCount / totalAttempts

  // Self-success ratio: what proportion of non-teacher attempts succeeded?
  const nonTeacherAttempts = record.selfRecallSuccessCount + record.failedRecallCount
  const selfSuccessRatio =
    nonTeacherAttempts > 0 ? record.selfRecallSuccessCount / nonTeacherAttempts : 0

  // High teacher dependency if:
  // - High teacher ratio (bridge mostly confirmed by teacher)
  // - Low self-success ratio (fails without teacher)
  const dependencyFromRatio = teacherRatio * 0.6
  const dependencyFromFailure = (1 - selfSuccessRatio) * 0.4

  return Math.min(1.0, dependencyFromRatio + dependencyFromFailure)
}
