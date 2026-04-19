/**
 * Advance Workspace Phase
 *
 * Phase 3: Determines when to transition workspace phases based on internal dynamics.
 */

import type { WorkspacePhase, WorkspaceState } from './workspacePhaseMachine'
import type { EventBoundary } from '../boundary/boundaryTypes'
import type { CoalitionState } from '../coalition/mergeCoalitionState'
import type { InteroceptiveControl } from '../interoception/applyInteroceptiveControl'

export type AdvanceWorkspacePhaseInput = {
  currentState: WorkspaceState
  eventBoundary?: EventBoundary
  coalitionState: CoalitionState
  interoceptiveControl: InteroceptiveControl
  surpriseMagnitude: number
}

/**
 * Determine the next workspace phase based on internal dynamics.
 *
 * Phase transitions are NOT arbitrary or cosmetic.
 * They respond to:
 * - Event boundaries (trigger release)
 * - Coalition stability (stable -> hold, unstable -> encode)
 * - Overload/distractor pressure (high -> block)
 * - Recovery pressure (high -> release)
 */
export const advanceWorkspacePhase = ({
  currentState,
  eventBoundary,
  coalitionState,
  interoceptiveControl,
  surpriseMagnitude,
}: AdvanceWorkspacePhaseInput): WorkspacePhase => {
  const { phase, phaseTimer, distractorPressure, stability } = currentState

  // Transition speed affected by interoceptive control
  const minPhaseTime = Math.max(1, Math.floor(2 / interoceptiveControl.workspaceTransitionSpeed))

  // Rule 1: Event boundary triggers release
  if (eventBoundary?.triggered && eventBoundary.score > 0.6) {
    return 'release'
  }

  // Rule 2: High distractor pressure or overload -> block
  if (distractorPressure > 0.7 || (phaseTimer > minPhaseTime && currentState.heldItems.length > 5)) {
    return 'block'
  }

  // Rule 3: High coalition tension -> encode (need to update)
  if (coalitionState.unresolvedTension > 0.6 && phase !== 'encode') {
    return 'encode'
  }

  // Rule 4: Stable coalition + time in encode -> hold
  if (
    phase === 'encode' &&
    coalitionState.unresolvedTension < 0.3 &&
    stability > 0.6 &&
    phaseTimer >= minPhaseTime
  ) {
    return 'hold'
  }

  // Rule 5: High surprise -> encode (new information)
  if (surpriseMagnitude > 0.6 && phase === 'hold') {
    return 'encode'
  }

  // Rule 6: Block phase resolves after filtering
  if (phase === 'block' && phaseTimer >= minPhaseTime && distractorPressure < 0.4) {
    return 'encode'
  }

  // Rule 7: Release phase completes quickly
  if (phase === 'release' && phaseTimer >= 1) {
    return 'encode'
  }

  // Rule 8: Hold phase can persist, but releases if stale
  if (phase === 'hold' && phaseTimer > minPhaseTime * 3 && stability < 0.5) {
    return 'release'
  }

  // Default: stay in current phase
  return phase
}
