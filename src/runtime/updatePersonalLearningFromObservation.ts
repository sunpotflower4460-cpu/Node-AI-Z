import { updatePersonalLearning } from '../intelligence/learning/personalLearning'
import type { PersonalLearningState } from '../intelligence/learning/types'
import { updateSomaticMarkers } from '../intelligence/somatic'
import type { ObservationRecord } from '../types/experience'

export const DEFAULT_OBSERVATION_DECISION_SHAPE = {
  stance: 'answer' as const,
  shouldAnswerQuestion: false,
  shouldOfferStep: false,
  shouldStayOpen: false,
}

const NEUTRAL_SOMATIC_OUTCOME = {
  naturalness: 0,
  safety: 0,
  helpfulness: 0,
  openness: 0,
}

export const updatePersonalLearningFromObservation = (
  state: PersonalLearningState,
  record: ObservationRecord,
): PersonalLearningState => {
  const somaticSignature = record.chunkedResult?.somaticSignature
  if (!somaticSignature) {
    return state
  }

  return {
    ...updatePersonalLearning(state, record.pipelineResult.pathwayKeys ?? []),
    somaticMarkers: updateSomaticMarkers(
      state.somaticMarkers ?? [],
      somaticSignature,
      DEFAULT_OBSERVATION_DECISION_SHAPE,
      NEUTRAL_SOMATIC_OUTCOME,
      Date.now(),
    ),
  }
}
