import type { TeacherJudgment, TeacherJudgmentType } from '../signalTeacherTypes'
import { createTeacherJudgment } from '../createTeacherJudgment'

export function createHumanTeacherJudgment(
  candidateId: string,
  humanChoice: 'same' | 'similar_but_different' | 'different' | 'hold',
): TeacherJudgment {
  const mapping: Record<typeof humanChoice, { judgment: TeacherJudgmentType; confidence: number }> = {
    same: { judgment: 'same_object', confidence: 1.0 },
    similar_but_different: { judgment: 'similar_but_different', confidence: 0.7 },
    different: { judgment: 'different', confidence: 1.0 },
    hold: { judgment: 'uncertain', confidence: 0.3 },
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
