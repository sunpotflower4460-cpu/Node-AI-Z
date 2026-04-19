/**
 * Workspace Module
 * Phase 3: Phase-based working memory control
 */

export {
  type WorkspacePhase,
  type WorkspaceItem,
  type WorkspaceState,
  createDefaultWorkspaceState,
  WORKSPACE_PHASE_DESCRIPTIONS,
} from './workspacePhaseMachine'
export {
  advanceWorkspacePhase,
  type AdvanceWorkspacePhaseInput,
} from './advanceWorkspacePhase'
export {
  applyWorkspacePhaseControl,
  type ApplyWorkspacePhaseControlInput,
  type WorkspacePhaseControlResult,
} from './applyWorkspacePhaseControl'
