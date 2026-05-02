import type { PersistentOrganismState } from './signalOrganismTypes'

/**
 * Creates the initial persistent organism state for New Signal Mode.
 * The initial state is not empty — it carries weak baseline activity
 * to ensure continuity from the very first turn.
 */
export function createInitialOrganismState(): PersistentOrganismState {
  const now = Date.now()
  return {
    organismId: `org_${now}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    lastActiveAt: now,
    lastBackgroundTickAt: undefined,

    lifecycle: {
      turnCount: 0,
      backgroundTickCount: 0,
      totalInputCount: 0,
      totalReplayCount: 0,
    },

    regulation: {
      energy: 0.65,
      curiosity: 0.45,
      uncertainty: 0.35,
      safety: 0.6,
      noveltyHunger: 0.4,
      replayPressure: 0.2,
      consolidationPressure: 0.1,
      overload: 0.05,
    },

    continuity: {
      selfEcho: 0.1,
      internalRhythm: 0.5,
      baselineActivation: 0.08,
      replayTendency: 0.15,
      afterglowStrength: 0.1,
    },

    sourceBalance: {
      externalInputRatio: 0.0,
      internalReplayRatio: 0.0,
      teacherInjectedRatio: 0.0,
      selfGeneratedRatio: 0.0,
    },

    modalityBalance: {
      textRatio: 0.0,
      imageRatio: 0.0,
      audioRatio: 0.0,
    },

    learning: {
      teacherDependency: 0.5,
      learningStage: 0,
      teacherFreeRecallScore: 0.0,
      bridgeMaturityAverage: 0.0,
    },

    recent: {
      recentAssemblyIds: [],
      recentProtoSeedIds: [],
      replayQueueIds: [],
      openQuestionIds: [],
    },
  }
}
