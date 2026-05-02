import type { SameObjectBindingCandidate, TeacherJudgment } from './signalTeacherTypes'

export function applyTeacherJudgmentToBinding(
  candidate: SameObjectBindingCandidate,
  judgment: TeacherJudgment,
): SameObjectBindingCandidate {
  const now = Date.now()
  const base = {
    ...candidate,
    updatedAt: now,
    teacher: {
      ...candidate.teacher,
      teacherChecked: true,
      teacherJudgmentId: judgment.id,
    },
  }

  switch (judgment.judgment) {
    case 'same_object':
      return {
        ...base,
        status: 'teacher_confirmed',
        teacher: {
          ...base.teacher,
          teacherConfirmCount: base.teacher.teacherConfirmCount + 1,
        },
        score: {
          ...base.score,
          teacherConfidence: judgment.confidence,
          overallBindingScore: Math.min(1, base.score.overallBindingScore + 0.1),
        },
      }
    case 'same_category':
      return {
        ...base,
        status: 'uncertain',
        teacher: {
          ...base.teacher,
          teacherConfirmCount: base.teacher.teacherConfirmCount + 1,
        },
      }
    case 'similar_but_different':
      return {
        ...base,
        status: 'uncertain',
        risk: {
          ...base.risk,
          falseBindingRisk: Math.min(1, base.risk.falseBindingRisk + 0.15),
        },
      }
    case 'different':
      return {
        ...base,
        status: 'teacher_rejected',
        teacher: {
          ...base.teacher,
          teacherRejectCount: base.teacher.teacherRejectCount + 1,
        },
      }
    case 'uncertain':
      return {
        ...base,
        status: 'uncertain',
        notes: [...base.notes, 'needs_more_evidence'],
      }
  }
}
