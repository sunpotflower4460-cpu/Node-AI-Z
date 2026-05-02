import type { SameObjectBindingCandidate } from '../signalTeacher/signalTeacherTypes'
import type { CrossModalRecallResult } from './crossModalRecallTypes'
import { updateTeacherDependency } from '../signalTeacher/updateTeacherDependency'

export function evaluateCrossModalRecall(
  result: CrossModalRecallResult,
  candidates: SameObjectBindingCandidate[],
): { updated: SameObjectBindingCandidate[]; notes: string[] } {
  const notes: string[] = []
  const updated = candidates.map(c => {
    if (!result.recalledCandidateIds.includes(c.id)) return c
    const event = result.success ? 'recall_success' : 'recall_failure'
    const next = updateTeacherDependency(c, event)
    notes.push(`${event}:${c.id}`)
    return next
  })
  return { updated, notes }
}
