import type { GuardianReviewRequest } from '../guardianTypes'
import type { AiSenseiReviewPayload } from './aiSenseiTypes'

export const buildAiSenseiPayload = (
  request: GuardianReviewRequest
): AiSenseiReviewPayload => {
  return {
    requestId: request.id,
    guardianMode:
      request.guardianMode === 'human_required'
        ? 'human_required'
        : 'guardian_assisted',
    candidateKind: request.candidate.type,
    confidenceScore: request.validation.confidenceScore,
    riskLevel: request.validation.riskLevel,
    summary: [...request.summary],
    cautionNotes: [...request.cautionNotes],
  }
}
