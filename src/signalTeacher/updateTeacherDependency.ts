import type { SameObjectBindingCandidate } from './signalTeacherTypes'

const DEPENDENCY_DECREASE_PER_SUCCESS = 0.1
const DEPENDENCY_INCREASE_PER_FAILURE = 0.05
const INITIAL_TEACHER_DEPENDENCY = 0.8
const TEACHER_FREE_THRESHOLD = 5
const TEACHER_LIGHT_THRESHOLD = 3
const RECALLED_ONCE_THRESHOLD = 1

export function updateTeacherDependency(
  candidate: SameObjectBindingCandidate,
  event: 'recall_success' | 'recall_failure' | 'teacher_confirm',
): SameObjectBindingCandidate {
  const now = Date.now()

  if (event === 'recall_success') {
    const newDep = Math.max(0, candidate.teacher.teacherDependencyScore - DEPENDENCY_DECREASE_PER_SUCCESS)
    const newSuccessCount = candidate.recall.recallSuccessCount + 1
    let status = candidate.status
    if (newSuccessCount >= TEACHER_FREE_THRESHOLD) status = 'teacher_free'
    else if (newSuccessCount >= TEACHER_LIGHT_THRESHOLD) status = 'teacher_light'
    else if (newSuccessCount >= RECALLED_ONCE_THRESHOLD && status === 'teacher_confirmed') status = 'recalled_once'
    return {
      ...candidate,
      updatedAt: now,
      status,
      teacher: { ...candidate.teacher, teacherDependencyScore: newDep },
      recall: {
        ...candidate.recall,
        recallSuccessCount: newSuccessCount,
        recallAttemptCount: candidate.recall.recallAttemptCount + 1,
        lastRecallAt: now,
      },
    }
  }

  if (event === 'recall_failure') {
    return {
      ...candidate,
      updatedAt: now,
      teacher: {
        ...candidate.teacher,
        teacherDependencyScore: Math.min(1, candidate.teacher.teacherDependencyScore + DEPENDENCY_INCREASE_PER_FAILURE),
      },
      recall: {
        ...candidate.recall,
        recallFailureCount: candidate.recall.recallFailureCount + 1,
        recallAttemptCount: candidate.recall.recallAttemptCount + 1,
        lastRecallAt: now,
      },
    }
  }

  // teacher_confirm
  return {
    ...candidate,
    updatedAt: now,
    teacher: { ...candidate.teacher, teacherDependencyScore: INITIAL_TEACHER_DEPENDENCY },
  }
}
