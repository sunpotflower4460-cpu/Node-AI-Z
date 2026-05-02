import type { SameObjectBindingCandidate, TeacherJudgment } from './signalTeacherTypes'

const TEACHER_CONFIRMATION_SCORE_BOOST = 0.1
const SIMILAR_BUT_DIFFERENT_RISK_INCREASE = 0.15

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
          overallBindingScore: Math.min(1, base.score.overallBindingScore + TEACHER_CONFIRMATION_SCORE_BOOST),
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
          falseBindingRisk: Math.min(1, base.risk.falseBindingRisk + SIMILAR_BUT_DIFFERENT_RISK_INCREASE),
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
