import type { TeacherAdapter, TeacherAdapterInput, TeacherAdapterResult } from './teacherAdapterTypes'
import { createTeacherJudgment } from '../createTeacherJudgment'
import type { TeacherJudgmentType } from '../signalTeacherTypes'

const USER_PAIRING_CONFIDENCE = 0.8
const FALSE_BINDING_RISK_THRESHOLD = 0.6
const SIMILAR_BUT_DIFFERENT_CONFIDENCE = 0.55
const FEATURE_SIMILARITY_THRESHOLD = 0.7
const SAME_CATEGORY_CONFIDENCE = 0.6
const TEMPORAL_COOCCURRENCE_UNCERTAIN_CONFIDENCE = 0.5
const DEFAULT_UNCERTAIN_CONFIDENCE = 0.4

function decideMockJudgment(input: TeacherAdapterInput): { judgment: TeacherJudgmentType; confidence: number } {
  const { candidate } = input
  if (candidate.source === 'user_pairing') {
    return { judgment: 'same_object', confidence: USER_PAIRING_CONFIDENCE }
  }
  if (candidate.risk.falseBindingRisk > FALSE_BINDING_RISK_THRESHOLD) {
    return { judgment: 'similar_but_different', confidence: SIMILAR_BUT_DIFFERENT_CONFIDENCE }
  }
  if (candidate.score.featureSimilarityScore > FEATURE_SIMILARITY_THRESHOLD) {
    return { judgment: 'same_category', confidence: SAME_CATEGORY_CONFIDENCE }
  }
  if (
    candidate.source === 'temporal_cooccurrence' &&
    candidate.modalities.length >= 2 &&
    candidate.modalities[0] !== candidate.modalities[1]
  ) {
    return { judgment: 'uncertain', confidence: TEMPORAL_COOCCURRENCE_UNCERTAIN_CONFIDENCE }
  }
  return { judgment: 'uncertain', confidence: DEFAULT_UNCERTAIN_CONFIDENCE }
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
