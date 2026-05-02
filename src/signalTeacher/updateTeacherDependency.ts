import type { SameObjectBindingCandidate } from './signalTeacherTypes'

export function updateTeacherDependency(
  candidate: SameObjectBindingCandidate,
  event: 'recall_success' | 'recall_failure' | 'teacher_confirm',
): SameObjectBindingCandidate {
  const now = Date.now()

  if (event === 'recall_success') {
    const newDep = Math.max(0, candidate.teacher.teacherDependencyScore - 0.1)
    const newSuccessCount = candidate.recall.recallSuccessCount + 1
    let status = candidate.status
    if (newSuccessCount >= 5) status = 'teacher_free'
    else if (newSuccessCount >= 3) status = 'teacher_light'
    else if (newSuccessCount >= 1 && status === 'teacher_confirmed') status = 'recalled_once'
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
        teacherDependencyScore: Math.min(1, candidate.teacher.teacherDependencyScore + 0.05),
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
    teacher: { ...candidate.teacher, teacherDependencyScore: 0.8 },
  }
}
