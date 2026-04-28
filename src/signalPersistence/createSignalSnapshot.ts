import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalLoopState } from '../signalLoop/signalLoopTypes'
import type { SignalConsolidationState } from '../signalConsolidation/signalConsolidationTypes'
import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import type { SignalModeSnapshot } from './signalPersistenceTypes'
import { SIGNAL_SNAPSHOT_VERSION } from './signalPersistenceTypes'

export type CreateSnapshotInput = {
  fieldState: SignalFieldState
  personalBranch: SignalPersonalBranch
  loopState: SignalLoopState
  consolidationState?: SignalConsolidationState
  attentionBudget?: SignalAttentionBudget
}

export function createSignalSnapshot(input: CreateSnapshotInput): SignalModeSnapshot {
  const now = Date.now()
  const { fieldState, personalBranch, loopState, consolidationState, attentionBudget } = input

  return {
    id: `snap_${now}_${Math.random().toString(36).slice(2, 8)}`,
    version: SIGNAL_SNAPSHOT_VERSION,
    createdAt: now,
    updatedAt: now,

    signalFieldState: fieldState,
    signalPersonalBranch: personalBranch,
    signalLoopState: loopState,

    attentionBudget,
    modulatorState: personalBranch.modulatorState,
    outcomeMemory: personalBranch.outcomeMemory,
    predictionMemory: personalBranch.predictionMemory,
    developmentState: personalBranch.developmentState,
    consolidationState,

    contrastState: personalBranch.contrastRecords,
    sequenceState: personalBranch.sequenceRecords,

    metadata: {
      mode: 'signal_mode',
      particleCount: fieldState.particles.length,
      assemblyCount: fieldState.assemblies.length,
      bridgeCount: personalBranch.bridgeRecords.length,
      protoSeedCount: personalBranch.protoSeedRecords.length,
      developmentStage: personalBranch.developmentState
        ? `stage_${personalBranch.developmentState.stage}`
        : undefined,
    },
  }
}
