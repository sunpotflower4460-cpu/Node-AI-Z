/**
 * Workspace Phase Machine
 *
 * Phase 3: Working memory with phase-based control.
 * NOT a static storage box. Phases control what gets admitted, held, blocked, or released.
 */

export type WorkspacePhase = 'encode' | 'hold' | 'block' | 'release'

export type WorkspaceItem = {
  id: string
  content: string
  strength: number
  age: number // turns since admission
}

export type WorkspaceState = {
  phase: WorkspacePhase
  heldItems: WorkspaceItem[]
  stability: number
  distractorPressure: number
  phaseTimer: number // turns in current phase
}

/**
 * Create default workspace state
 */
export const createDefaultWorkspaceState = (): WorkspaceState => ({
  phase: 'encode',
  heldItems: [],
  stability: 0.7,
  distractorPressure: 0.2,
  phaseTimer: 0,
})

/**
 * Workspace phase descriptions for understanding each phase's role
 */
export const WORKSPACE_PHASE_DESCRIPTIONS: Record<WorkspacePhase, string> = {
  encode: 'Admit new information, update held items, low filtering',
  hold: 'Protect current coalition, resist distractors, maintain focus',
  block: 'Filter out excess input, prevent overload, selective admission',
  release: 'Clear stale items, prepare for new context, reset focus',
}
