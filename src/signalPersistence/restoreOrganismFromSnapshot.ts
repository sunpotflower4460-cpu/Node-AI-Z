import type { SignalModeSnapshot } from './signalPersistenceTypes'
import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from '../signalBackground/signalBackgroundTypes'
import { createInitialOrganismState } from '../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../signalBackground/createInitialBackgroundLoopState'

export type RestoreOrganismResult = {
  organismState: PersistentOrganismState
  backgroundLoopState: BackgroundLoopState
  warnings: string[]
}

/**
 * Restores organism and background loop state from a Signal Mode snapshot.
 *
 * Rules:
 * - If snapshot has valid organism state → restore it
 * - If missing → create initial state
 * - If broken → warn and create initial state
 */
export function restoreOrganismFromSnapshot(snapshot: SignalModeSnapshot): RestoreOrganismResult {
  const warnings: string[] = []

  let organismState: PersistentOrganismState
  try {
    if (snapshot.organismState && typeof snapshot.organismState === 'object') {
      const candidate = snapshot.organismState as Partial<PersistentOrganismState>
      if (candidate.organismId && candidate.regulation && candidate.continuity) {
        // Deep-merge with defaults to fill any missing fields from older snapshots
        const initial = createInitialOrganismState()
        organismState = {
          ...initial,
          ...(candidate as PersistentOrganismState),
          regulation: { ...initial.regulation, ...candidate.regulation },
          continuity: { ...initial.continuity, ...candidate.continuity },
          sourceBalance: { ...initial.sourceBalance, ...candidate.sourceBalance },
          learning: { ...initial.learning, ...candidate.learning },
          lifecycle: { ...initial.lifecycle, ...candidate.lifecycle },
          recent: { ...initial.recent, ...candidate.recent },
        }
      } else {
        warnings.push('Snapshot had incomplete organism state; using initial state.')
        organismState = createInitialOrganismState()
      }
    } else {
      if (snapshot.version !== undefined && snapshot.version < 2) {
        warnings.push(
          `Snapshot version ${snapshot.version} predates organism state; using initial state.`,
        )
      }
      organismState = createInitialOrganismState()
    }
  } catch {
    warnings.push('Failed to parse organism state from snapshot; using initial state.')
    organismState = createInitialOrganismState()
  }

  let backgroundLoopState: BackgroundLoopState
  try {
    if (snapshot.backgroundLoopState && typeof snapshot.backgroundLoopState === 'object') {
      const candidate = snapshot.backgroundLoopState as Partial<BackgroundLoopState>
      if (candidate.mode !== undefined && candidate.health !== undefined) {
        const initial = createInitialBackgroundLoopState()
        backgroundLoopState = {
          ...initial,
          ...(candidate as BackgroundLoopState),
          health: { ...initial.health, ...candidate.health },
        }
      } else {
        warnings.push('Snapshot had incomplete background loop state; using initial state.')
        backgroundLoopState = createInitialBackgroundLoopState()
      }
    } else {
      backgroundLoopState = createInitialBackgroundLoopState()
    }
  } catch {
    warnings.push('Failed to parse background loop state from snapshot; using initial state.')
    backgroundLoopState = createInitialBackgroundLoopState()
  }

  return { organismState, backgroundLoopState, warnings }
}
