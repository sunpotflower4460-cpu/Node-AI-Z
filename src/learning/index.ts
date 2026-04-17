/**
 * Learning layer.
 * Hosts the session / personal / global candidate learning states that accumulate
 * pathway-level updates from runtime observations.
 */
export type {
  PathwayStrengthMap,
  SessionLearningState,
  PersonalLearningState,
  GlobalLearningCandidate,
  GlobalCandidateState,
  LearningLayers,
} from './types'

export { createSessionLearningState, updateSessionLearning } from './sessionLearning'
export { createPersonalLearningState, updatePersonalLearning } from './personalLearning'
export { createGlobalCandidateState, updateGlobalCandidates } from './globalCandidateLearning'
export { applyPathwayPlasticity } from './applyPathwayPlasticity'
export { extractPathwayKeys } from './pathwayKeys'
