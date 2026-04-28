import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalLoopState } from '../signalLoop/signalLoopTypes'
import type { SignalConsolidationState } from '../signalConsolidation/signalConsolidationTypes'
import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import type { SignalModeSnapshot } from './signalPersistenceTypes'
import { SIGNAL_SNAPSHOT_VERSION } from './signalPersistenceTypes'
import { validateSignalSnapshot } from './validateSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../signalLoop/createInitialSignalLoopState'
import { createInitialAttentionBudget } from '../signalAttention/createInitialAttentionBudget'
import { createConsolidationState } from '../signalConsolidation/createConsolidationState'

export type RestoreResult = {
  fieldState: SignalFieldState
  personalBranch: SignalPersonalBranch
  loopState: SignalLoopState
  consolidationState: SignalConsolidationState
  attentionBudget: SignalAttentionBudget
  warnings: string[]
}

export function restoreSignalSnapshot(snapshot: SignalModeSnapshot): RestoreResult | null {
  const validation = validateSignalSnapshot(snapshot)
  if (!validation.valid) {
    return null
  }

  const warnings = [...validation.warnings]

  if (snapshot.version !== SIGNAL_SNAPSHOT_VERSION) {
    warnings.push(
      `Restoring from version ${snapshot.version}; current version is ${SIGNAL_SNAPSHOT_VERSION}. Some fields may be missing.`,
    )
  }

  const fieldState = (snapshot.signalFieldState as SignalFieldState | undefined) ?? {
    particles: [],
    links: [],
    recentActivations: [],
    assemblies: [],
    protoMeanings: [],
    crossModalBridges: [],
    frameCount: 0,
  }

  const personalBranch =
    (snapshot.signalPersonalBranch as SignalPersonalBranch | undefined) ??
    createInitialSignalPersonalBranch()

  const loopState =
    (snapshot.signalLoopState as SignalLoopState | undefined) ?? createInitialSignalLoopState()

  const consolidationState =
    (snapshot.consolidationState as SignalConsolidationState | undefined) ??
    createConsolidationState()

  const attentionBudget =
    (snapshot.attentionBudget as SignalAttentionBudget | undefined) ??
    createInitialAttentionBudget()

  return {
    fieldState,
    personalBranch,
    loopState,
    consolidationState,
    attentionBudget,
    warnings,
  }
}
