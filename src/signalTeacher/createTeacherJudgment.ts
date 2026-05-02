import type { TeacherJudgment, TeacherJudgmentType } from './signalTeacherTypes'

const SAME_OBJECT_CONFIDENCE_THRESHOLD = 0.7

export function createTeacherJudgment(params: {
  candidateId: string
  teacherType: TeacherJudgment['teacherType']
  judgment: TeacherJudgmentType
  confidence: number
  explanation: string
  suggestedLabel?: TeacherJudgment['suggestedLabel']
}): TeacherJudgment {
  const now = Date.now()
  const id = `judgment_${now}_${Math.random().toString(36).slice(2, 8)}`

  const safety = (() => {
    switch (params.judgment) {
      case 'same_object':
        return {
          shouldStrengthen: params.confidence > SAME_OBJECT_CONFIDENCE_THRESHOLD,
          shouldHold: params.confidence <= SAME_OBJECT_CONFIDENCE_THRESHOLD,
          shouldReject: false,
          needsMoreEvidence: false,
        }
      case 'same_category':
        return { shouldStrengthen: false, shouldHold: true, shouldReject: false, needsMoreEvidence: true }
      case 'similar_but_different':
        return { shouldStrengthen: false, shouldHold: false, shouldReject: false, needsMoreEvidence: true }
      case 'different':
        return { shouldStrengthen: false, shouldHold: false, shouldReject: true, needsMoreEvidence: false }
      case 'uncertain':
        return { shouldStrengthen: false, shouldHold: true, shouldReject: false, needsMoreEvidence: true }
    }
  })()

  return {
    id,
    createdAt: now,
    candidateId: params.candidateId,
    teacherType: params.teacherType,
    judgment: params.judgment,
    confidence: params.confidence,
    explanation: params.explanation,
    ...(params.suggestedLabel ? { suggestedLabel: params.suggestedLabel } : {}),
    safety,
  }
}
