import type { PersistentOrganismState } from './signalOrganismTypes'

export type OrganismSummary = {
  energy: number
  curiosity: number
  uncertainty: number
  safety: number
  replayPressure: number
  teacherDependency: number
  selfEcho: number
  internalRhythm: number
  turnCount: number
  backgroundTickCount: number
  totalInputCount: number
  totalReplayCount: number
  replayQueueLength: number
  openQuestionCount: number
  /** Proportion of inputs by modality */
  modalityBalance: {
    textRatio: number
    imageRatio: number
    audioRatio: number
  }
  /** Short human-readable label for current regulation level */
  regulationLabel: string
}

/**
 * Builds a compact summary of the organism state for UI display.
 */
export function buildOrganismSummary(state: PersistentOrganismState): OrganismSummary {
  const { regulation, continuity, learning, lifecycle, recent } = state

  let regulationLabel = 'stable'
  if (regulation.overload > 0.7) {
    regulationLabel = 'overloaded'
  } else if (regulation.energy < 0.2) {
    regulationLabel = 'depleted'
  } else if (regulation.curiosity > 0.7) {
    regulationLabel = 'active'
  }

  return {
    energy: regulation.energy,
    curiosity: regulation.curiosity,
    uncertainty: regulation.uncertainty,
    safety: regulation.safety,
    replayPressure: regulation.replayPressure,
    teacherDependency: learning.teacherDependency,
    selfEcho: continuity.selfEcho,
    internalRhythm: continuity.internalRhythm,
    turnCount: lifecycle.turnCount,
    backgroundTickCount: lifecycle.backgroundTickCount,
    totalInputCount: lifecycle.totalInputCount,
    totalReplayCount: lifecycle.totalReplayCount,
    replayQueueLength: recent.replayQueueIds.length,
    openQuestionCount: recent.openQuestionIds.length,
    modalityBalance: state.modalityBalance,
    regulationLabel,
  }
}
