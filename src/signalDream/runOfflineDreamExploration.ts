import type { SignalPersonalBranch, SignalBridgeRecord } from '../signalBranch/signalBranchTypes'
import type { ContrastRecord } from '../signalContrast/signalContrastTypes'
import type { SignalSequenceRecord } from '../signalSequence/signalSequenceTypes'
import type { SignalPlasticityRecord } from '../signalPlasticity/signalPlasticityTypes'
import type { DreamExplorationResult, DreamCandidate } from './signalDreamTypes'
import { evaluateDreamBridge } from './evaluateDreamBridge'

function createDreamBridgeRecord(candidate: DreamCandidate, timestamp: number, confidence: number): SignalBridgeRecord {
  return {
    id: `dream_bridge_${candidate.sourceAssemblyId}_${candidate.targetAssemblyId}_${timestamp}`,
    sourceAssemblyId: candidate.sourceAssemblyId,
    targetAssemblyId: candidate.targetAssemblyId,
    stage: 'tentative',
    createdBy: 'self_discovered',
    teacherConfirmCount: 0,
    selfRecallSuccessCount: 0,
    failedRecallCount: 0,
    confidence,
    teacherDependencyScore: 0.2,
    recallSuccessScore: 0,
    lastUsedAt: timestamp,
  }
}

export function runOfflineDreamExploration(input: {
  branch: SignalPersonalBranch
  candidates: DreamCandidate[]
  contrastRecords: ContrastRecord[]
  sequenceRecords: SignalSequenceRecord[]
  plasticityRecords: SignalPlasticityRecord[]
  timestamp: number
}): { branch: SignalPersonalBranch; result: DreamExplorationResult } {
  const evaluations = input.candidates.map(candidate =>
    evaluateDreamBridge({
      candidate,
      contrastRecords: input.contrastRecords,
      sequenceRecords: input.sequenceRecords,
      plasticityRecords: input.plasticityRecords,
    }),
  )

  const updatedBridgeRecords = [...input.branch.bridgeRecords]
  const strengthenedBridgeIds: string[] = []
  const createdBridgeIds: string[] = []
  const notes: string[] = []

  for (const evaluation of evaluations) {
    if (!evaluation.accepted) {
      continue
    }

    const candidate = input.candidates.find(item => item.id === evaluation.candidateId)
    if (!candidate) {
      continue
    }

    const existingIndex = updatedBridgeRecords.findIndex(
      bridge =>
        bridge.sourceAssemblyId === candidate.sourceAssemblyId &&
        bridge.targetAssemblyId === candidate.targetAssemblyId,
    )

    if (existingIndex >= 0) {
      const existing = updatedBridgeRecords[existingIndex]!
      updatedBridgeRecords[existingIndex] = {
        ...existing,
        confidence: Math.max(existing.confidence, evaluation.confidence),
        teacherDependencyScore: Math.max(0, existing.teacherDependencyScore - 0.08),
        lastUsedAt: input.timestamp,
      }
      strengthenedBridgeIds.push(existing.id)
      notes.push(`Dream strengthened bridge ${existing.id}`)
    } else {
      const created = createDreamBridgeRecord(candidate, input.timestamp, evaluation.confidence)
      updatedBridgeRecords.push(created)
      createdBridgeIds.push(created.id)
      notes.push(`Dream created tentative bridge ${created.id}`)
    }
  }

  return {
    branch: {
      ...input.branch,
      bridgeRecords: updatedBridgeRecords,
      updatedAt: input.timestamp,
    },
    result: {
      candidates: input.candidates,
      evaluations,
      strengthenedBridgeIds,
      createdBridgeIds,
      notes,
    },
  }
}
