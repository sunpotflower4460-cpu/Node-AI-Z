/**
 * Update Workspace State (Phase M3)
 *
 * Converts workspace gate results back into WorkspaceState format
 * for persistence in SessionBrainState.
 */

import type { WorkspaceState, WorkspaceItem as LegacyWorkspaceItem } from '../workspace/workspacePhaseMachine';
import type { WorkspaceItem, WorkspaceGateResult } from './workspaceTypes';

/**
 * Update the workspace state from gate results.
 * Converts from WorkspaceItem format back to WorkspaceState format.
 */
export const updateWorkspaceState = (
  currentState: WorkspaceState,
  gateResult: WorkspaceGateResult,
  currentTurn: number,
): WorkspaceState => {
  // Convert WorkspaceItem[] to LegacyWorkspaceItem[]
  const updatedHeldItems: LegacyWorkspaceItem[] = gateResult.heldItems.map((item) => ({
    id: item.id,
    content: item.label,
    strength: item.salience,
    age: currentTurn - item.lastTouchedTurn,
  }));

  // Update stability based on gate activity
  let newStability = currentState.stability;

  // Stability increases when items are held successfully
  const holdCount = gateResult.decisions.filter((d) => d.action === 'hold').length;
  if (holdCount > 0 && gateResult.heldItems.length <= 5) {
    newStability = Math.min(1.0, newStability + 0.05);
  }

  // Stability decreases when many items are flushed
  if (gateResult.flushedCount > 3) {
    newStability = Math.max(0.0, newStability - 0.1);
  }

  // Update distractor pressure based on shield count
  let newDistractorPressure = currentState.distractorPressure;

  // Shielded items increase distractor pressure
  if (gateResult.shieldedCount > 0) {
    newDistractorPressure = Math.min(1.0, newDistractorPressure + gateResult.shieldedCount * 0.05);
  }

  // Successfully held items reduce distractor pressure
  if (holdCount > 0) {
    newDistractorPressure = Math.max(0.0, newDistractorPressure - 0.03);
  }

  // Increment phase timer if phase hasn't changed
  const newPhaseTimer = currentState.phaseTimer + 1;

  return {
    phase: currentState.phase,
    heldItems: updatedHeldItems,
    stability: newStability,
    distractorPressure: newDistractorPressure,
    phaseTimer: newPhaseTimer,
  };
};
