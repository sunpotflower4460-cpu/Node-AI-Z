/**
 * Phase 2 Ablation Flags
 *
 * These flags allow toggling Phase 2 features on/off
 * for comparison and debugging.
 */

export type Phase2AblationFlags = {
  /** Enable event boundary detection */
  boundaryEnabled: boolean
  /** Enable confidence meta-layer (decision/interpretation split) */
  confidenceEnabled: boolean
  /** Enable uncertainty precision weighting */
  uncertaintyEnabled: boolean
  /** Enable idle replay */
  replayEnabled: boolean
}

/**
 * Default ablation flags (all features enabled)
 */
export const DEFAULT_PHASE2_FLAGS: Phase2AblationFlags = {
  boundaryEnabled: true,
  confidenceEnabled: true,
  uncertaintyEnabled: true,
  replayEnabled: true,
}

/**
 * All features disabled (baseline)
 */
export const BASELINE_PHASE2_FLAGS: Phase2AblationFlags = {
  boundaryEnabled: false,
  confidenceEnabled: false,
  uncertaintyEnabled: false,
  replayEnabled: false,
}
