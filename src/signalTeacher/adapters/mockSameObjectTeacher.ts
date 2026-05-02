import type { TeacherAdapter, TeacherAdapterInput, TeacherAdapterResult } from './teacherAdapterTypes'
import { createTeacherJudgment } from '../createTeacherJudgment'
import type { TeacherJudgmentType } from '../signalTeacherTypes'

function decideMockJudgment(input: TeacherAdapterInput): { judgment: TeacherJudgmentType; confidence: number } {
  const { candidate } = input
  if (candidate.source === 'user_pairing') {
    return { judgment: 'same_object', confidence: 0.8 }
  }
  if (candidate.risk.falseBindingRisk > 0.6) {
    return { judgment: 'similar_but_different', confidence: 0.55 }
  }
  if (candidate.score.featureSimilarityScore > 0.7) {
    return { judgment: 'same_category', confidence: 0.6 }
  }
  if (
    candidate.source === 'temporal_cooccurrence' &&
    candidate.modalities.length >= 2 &&
    candidate.modalities[0] != null &&
    candidate.modalities[1] != null &&
    candidate.modalities[0] !== candidate.modalities[1]
  ) {
    return { judgment: 'uncertain', confidence: 0.5 }
  }
  return { judgment: 'uncertain', confidence: 0.4 }
}

const adapter: TeacherAdapter = {
  async judge(input: TeacherAdapterInput): Promise<TeacherAdapterResult> {
    const { judgment, confidence } = decideMockJudgment(input)
    return createTeacherJudgment({
      candidateId: input.candidate.id,
      teacherType: 'mock',
      judgment,
      confidence,
      explanation: `mock:${judgment}`,
    })
  },
}

export const mockSameObjectTeacher: TeacherAdapter = adapter
