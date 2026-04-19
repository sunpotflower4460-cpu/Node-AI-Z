/**
 * Create Initial Brain State
 * Generates the starting brain state for a new session or when no prior state exists.
 */

import type { SessionBrainState } from './sessionBrainState'
import { buildEmptyPredictionState } from '../predictive/buildPredictionState'
import { createDefaultInteroceptiveState } from '../interoception/interoceptiveState'
import { createDefaultWorkspaceState } from '../workspace/workspacePhaseMachine'

/**
 * Creates an initial brain state for a new session.
 * This is used when starting a new session or when no prior state is available.
 *
 * @param sessionId Optional session identifier (generated if not provided)
 * @returns A fresh SessionBrainState with default values
 */
export const createInitialBrainState = (sessionId?: string): SessionBrainState => {
  const id = sessionId ?? `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    sessionId: id,
    turnCount: 0,
    temporalStates: new Map(),
    predictionState: buildEmptyPredictionState(0),
    afterglow: 0,
    recentFieldIntensity: 0.5,
    recentActivityAverage: 0.5,
    microSignalDimensions: {
      fieldTone: 'neutral',
      activeCueCount: 0,
      fusedConfidence: 0.5,
    },
    episodicBuffer: [],
    workspace: createDefaultWorkspaceState(),
    interoception: createDefaultInteroceptiveState(),
  }
}
