/**
 * Score Workspace Salience (Phase M3)
 *
 * Updates salience scores for workspace items based on current context,
 * stability, and unresolved status.
 */

import type { WorkspaceItem } from './workspaceTypes';

export type SalienceUpdateFactors = {
  afterglow: number; // 0.0 - 0.2
  recentFieldIntensity: number; // 0.0 - 1.0
  overloadPressure: number; // 0.0 - 1.0
  safetySense: number; // 0.0 - 1.0
  unresolvedThreadCount: number;
};

/**
 * Score and update salience for a workspace item based on context factors.
 */
export const scoreWorkspaceSalience = (
  item: WorkspaceItem,
  factors: SalienceUpdateFactors,
  currentTurn: number,
): WorkspaceItem => {
  let newSalience = item.salience;

  // Decay salience based on time since last touched
  const turnsSinceTouch = currentTurn - item.lastTouchedTurn;
  const timeDecay = Math.exp(-0.15 * turnsSinceTouch); // Exponential decay
  newSalience *= timeDecay;

  // Boost salience if item is unresolved and we have capacity
  if (item.unresolved > 0.6 && factors.overloadPressure < 0.5) {
    const unresolvedBoost = item.unresolved * 0.15;
    newSalience += unresolvedBoost;
  }

  // Reduce salience if under overload pressure
  if (factors.overloadPressure > 0.6) {
    const overloadPenalty = factors.overloadPressure * 0.2;
    newSalience -= overloadPenalty;
  }

  // Boost salience if item is stable and we have safety
  if (item.stability > 0.6 && factors.safetySense > 0.5) {
    const stabilityBoost = item.stability * 0.1;
    newSalience += stabilityBoost;
  }

  // Afterglow boosts recent items
  if (turnsSinceTouch <= 1 && factors.afterglow > 0.1) {
    newSalience += factors.afterglow;
  }

  // Field intensity can boost proto and option items
  if ((item.source === 'proto' || item.source === 'option') && factors.recentFieldIntensity > 0.6) {
    const fieldBoost = factors.recentFieldIntensity * 0.12;
    newSalience += fieldBoost;
  }

  // Clamp salience to [0, 1]
  newSalience = Math.max(0, Math.min(1, newSalience));

  // Update stability based on persistence
  let newStability = item.stability;
  if (turnsSinceTouch === 0) {
    // Being touched increases stability
    newStability = Math.min(1, newStability + 0.1);
  } else {
    // Not being touched decreases stability
    const stabilityDecay = 0.05 * turnsSinceTouch;
    newStability = Math.max(0, newStability - stabilityDecay);
  }

  return {
    ...item,
    salience: newSalience,
    stability: newStability,
  };
};

/**
 * Score all held items in the workspace.
 */
export const scoreAllWorkspaceItems = (
  heldItems: WorkspaceItem[],
  factors: SalienceUpdateFactors,
  currentTurn: number,
): WorkspaceItem[] => {
  return heldItems.map((item) => scoreWorkspaceSalience(item, factors, currentTurn));
};
