import type { ActiveAttentionTarget } from './activeAttentionTypes'

export function chooseTeacherQueryTargets(
  targets: ActiveAttentionTarget[],
  teacherBudget: number,
): string[] {
  if (teacherBudget <= 0) {
    return []
  }

  const limit = Math.max(0, Math.min(3, Math.floor(teacherBudget / 12)))
  if (limit === 0) {
    return []
  }

  return targets
    .filter(
      target =>
        target.recommendedAction === 'ask_teacher' ||
        target.reason === 'teacher_dependency_high' ||
        target.reason === 'contrast_unclear',
    )
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, limit)
    .map(target => target.targetId)
}
