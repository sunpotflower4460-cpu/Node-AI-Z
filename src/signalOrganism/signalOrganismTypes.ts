/**
 * Signal Organism Types
 *
 * Persistent internal state for New Signal Mode.
 * This is not a claim of consciousness — it is a continuity mechanism
 * for pre-semantic signal learning.
 */

export type PersistentOrganismState = {
  organismId: string
  createdAt: number
  lastActiveAt: number
  lastBackgroundTickAt?: number

  lifecycle: {
    turnCount: number
    backgroundTickCount: number
    totalInputCount: number
    totalReplayCount: number
  }

  regulation: {
    energy: number
    curiosity: number
    uncertainty: number
    safety: number
    noveltyHunger: number
    replayPressure: number
    consolidationPressure: number
    overload: number
  }

  continuity: {
    selfEcho: number
    internalRhythm: number
    baselineActivation: number
    replayTendency: number
    afterglowStrength: number
  }

  sourceBalance: {
    externalInputRatio: number
    internalReplayRatio: number
    teacherInjectedRatio: number
    selfGeneratedRatio: number
  }

  modalityBalance: {
    textRatio: number
    imageRatio: number
    audioRatio: number
  }

  learning: {
    teacherDependency: number
    learningStage: number
    teacherFreeRecallScore: number
    bridgeMaturityAverage: number
  }

  recent: {
    recentAssemblyIds: string[]
    recentProtoSeedIds: string[]
    replayQueueIds: string[]
    openQuestionIds: string[]
  }
}

/** Input to updateOrganismStateFromInput */
export type OrganismInputSignal = {
  activeParticleCount: number
  assemblyCount: number
  newAssemblyCount: number
  bridgeChangeCount: number
  predictionError: number
  riskLevel: number
  teacherInvolved: boolean
  recallSuccess: boolean
  timestamp: number
  /** Modality of the current input, used to update modalityBalance */
  inputModality?: 'text' | 'image' | 'audio'
}

/** Input to updateOrganismStateFromBackground */
export type OrganismBackgroundSignal = {
  cycleType: 'micro_pulse' | 'weak_replay' | 'maintenance'
  timestamp: number
}
