/**
 * Phase 3 Ablation Flags
 *
 * These flags allow toggling Phase 3 features on/off
 * for comparison and debugging.
 */

export type Phase3AblationFlags = {
  /** Enable interoceptive core (body-like regulation) */
  interoceptionEnabled: boolean
  /** Enable distributed coalition formation */
  coalitionEnabled: boolean
  /** Enable workspace phase-based control */
  workspacePhaseEnabled: boolean
  /** Enable active sensing policy */
  activeSensingEnabled: boolean
}

/**
 * Default ablation flags (all features enabled)
 */
export const DEFAULT_PHASE3_FLAGS: Phase3AblationFlags = {
  interoceptionEnabled: true,
  coalitionEnabled: true,
  workspacePhaseEnabled: true,
  activeSensingEnabled: true,
}

/**
 * All features disabled (baseline)
 */
export const BASELINE_PHASE3_FLAGS: Phase3AblationFlags = {
  interoceptionEnabled: false,
  coalitionEnabled: false,
  workspacePhaseEnabled: false,
  activeSensingEnabled: false,
}
