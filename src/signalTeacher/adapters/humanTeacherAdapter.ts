import type { TeacherJudgment, TeacherJudgmentType } from '../signalTeacherTypes'
import { createTeacherJudgment } from '../createTeacherJudgment'

const HUMAN_SAME_CONFIDENCE = 1.0
const HUMAN_SIMILAR_BUT_DIFFERENT_CONFIDENCE = 0.7
const HUMAN_DIFFERENT_CONFIDENCE = 1.0
const HUMAN_HOLD_CONFIDENCE = 0.3

export function createHumanTeacherJudgment(
  candidateId: string,
  humanChoice: 'same' | 'similar_but_different' | 'different' | 'hold',
): TeacherJudgment {
  const mapping: Record<typeof humanChoice, { judgment: TeacherJudgmentType; confidence: number }> = {
    same: { judgment: 'same_object', confidence: HUMAN_SAME_CONFIDENCE },
    similar_but_different: { judgment: 'similar_but_different', confidence: HUMAN_SIMILAR_BUT_DIFFERENT_CONFIDENCE },
    different: { judgment: 'different', confidence: HUMAN_DIFFERENT_CONFIDENCE },
    hold: { judgment: 'uncertain', confidence: HUMAN_HOLD_CONFIDENCE },
  }
  const { judgment, confidence } = mapping[humanChoice]
  return createTeacherJudgment({
    candidateId,
    teacherType: 'human',
    judgment,
    confidence,
    explanation: `human:${humanChoice}`,
  })
}
