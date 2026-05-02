import type { SameObjectBindingCandidate, TeacherJudgment } from './signalTeacherTypes'

const HIGH_DEPENDENCY_THRESHOLD = 0.7

export function buildTeacherSummary(
  candidates: SameObjectBindingCandidate[],
  judgments: TeacherJudgment[],
): {
  totalCandidates: number
  confirmedCount: number
  rejectedCount: number
  uncertainCount: number
  avgTeacherDependency: number
  avgBindingScore: number
  notes: string[]
} {
  const confirmedCount = candidates.filter(c => c.status === 'teacher_confirmed').length
  const rejectedCount = candidates.filter(c => c.status === 'teacher_rejected').length
  const uncertainCount = candidates.filter(c => c.status === 'uncertain').length
  const avgTeacherDependency =
    candidates.length > 0
      ? candidates.reduce((sum, c) => sum + c.teacher.teacherDependencyScore, 0) / candidates.length
      : 0
  const avgBindingScore =
    candidates.length > 0
      ? candidates.reduce((sum, c) => sum + c.score.overallBindingScore, 0) / candidates.length
      : 0

  const notes: string[] = []
  if (judgments.length > 0) notes.push(`judgments:${judgments.length}`)
  if (avgTeacherDependency > HIGH_DEPENDENCY_THRESHOLD) notes.push('high_teacher_dependency')

  return {
    totalCandidates: candidates.length,
    confirmedCount,
    rejectedCount,
    uncertainCount,
    avgTeacherDependency,
    avgBindingScore,
    notes,
  }
}
