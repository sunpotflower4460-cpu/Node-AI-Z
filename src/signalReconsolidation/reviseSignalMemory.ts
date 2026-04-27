import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalReconsolidationState } from './signalReconsolidationTypes'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

export function reviseSignalMemory(input: {
  branch: SignalPersonalBranch
  state: SignalReconsolidationState
  timestamp: number
}): { branch: SignalPersonalBranch; state: SignalReconsolidationState } {
  const revisedTargetIds: string[] = []

  const branch: SignalPersonalBranch = {
    ...input.branch,
    assemblyRecords: input.branch.assemblyRecords.map(record => {
      const window = input.state.openMemories.find(entry => entry.targetType === 'assembly' && entry.targetId === record.assemblyId)
      if (!window) {
        return record
      }
      revisedTargetIds.push(record.assemblyId)
      return {
        ...record,
        stabilityScore: clamp(record.stabilityScore - 0.04),
      }
    }),
    bridgeRecords: input.branch.bridgeRecords.map(record => {
      const window = input.state.openMemories.find(entry => entry.targetType === 'bridge' && entry.targetId === record.id)
      if (!window) {
        return record
      }
      revisedTargetIds.push(record.id)
      return {
        ...record,
        confidence: clamp(record.confidence - 0.05),
        teacherDependencyScore: clamp(record.teacherDependencyScore + 0.04),
      }
    }),
    protoSeedRecords: input.branch.protoSeedRecords.map(record => {
      const window = input.state.openMemories.find(entry => entry.targetType === 'proto_seed' && entry.targetId === record.protoSeedId)
      if (!window) {
        return record
      }
      revisedTargetIds.push(record.protoSeedId)
      return {
        ...record,
        stabilityScore: clamp(record.stabilityScore - 0.03),
      }
    }),
    sequenceRecords: input.branch.sequenceRecords.map(record => {
      const contextKey = record.assemblyIds.join('>') || 'root'
      const window = input.state.openMemories.find(entry => entry.targetType === 'sequence' && entry.targetId === contextKey)
      if (!window && !input.state.openMemories.some(entry => entry.targetType === 'sequence' && entry.targetId === record.id)) {
        return record
      }
      revisedTargetIds.push(record.id)
      return {
        ...record,
        predictionConfidence: clamp(record.predictionConfidence - 0.05),
        mismatchCount: record.mismatchCount + 1,
      }
    }),
    contrastRecords: input.branch.contrastRecords.map(record => {
      const window = input.state.openMemories.find(entry => entry.targetType === 'contrast' && entry.targetId === record.id)
      if (!window) {
        return record
      }
      revisedTargetIds.push(record.id)
      return {
        ...record,
        relation: record.relation === 'unknown' ? 'similar_but_different' : record.relation,
        confidence: clamp(record.confidence + 0.08),
      }
    }),
    updatedAt: input.timestamp,
  }

  return {
    branch,
    state: {
      ...input.state,
      recentlyRevisedTargetIds: revisedTargetIds.slice(-10),
      lastUpdatedAt: input.timestamp,
      notes:
        revisedTargetIds.length > 0
          ? ['Reconsolidation revised unstable memories instead of deleting them']
          : input.state.notes,
    },
  }
}
