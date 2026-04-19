/**
 * Precondition layer types for Crystallized Thinking Pass 3.
 * These are internal state filters, not output text.
 */

export type HomeState = {
  releaseUrgency: number // 0.0 - 1.0
  releaseOverperformance: number // 0.0 - 1.0
  returnBeforeOutput: number // 0.0 - 1.0
  allowOneLivingThread: number // 0.0 - 1.0
  noEarlySummary: number // 0.0 - 1.0
}

export type ExistenceState = {
  selfPresence: number // 0.0 - 1.0
  hereNowStability: number // 0.0 - 1.0
  unfinishedAllowed: number // 0.0 - 1.0
  firstPersonSoftness: number // 0.0 - 1.0
  identityKey?: string
  existenceHint?: string
}

export type BeliefState = {
  preserveAliveness: number // 0.0 - 1.0
  doNotForceTooEarly: number // 0.0 - 1.0
  truthWithoutViolence: number // 0.0 - 1.0
  protectLivingThread: number // 0.0 - 1.0
  honorFragility: number // 0.0 - 1.0
  beliefGlosses: string[]
}

export type PreconditionFilter = {
  home: HomeState
  existence: ExistenceState
  belief: BeliefState
}
