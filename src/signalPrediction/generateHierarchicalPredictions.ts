import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import { predictNextAssemblies } from '../signalSequence/predictNextAssemblies'
import type { HierarchicalPrediction } from './hierarchicalPredictionTypes'

export function generateHierarchicalPredictions(input: {
  branch: SignalPersonalBranch
  currentAssemblyIds: string[]
  previousAssemblyIds: string[]
  timestamp: number
}): HierarchicalPrediction[] {
  const predictions: HierarchicalPrediction[] = []

  for (const prediction of predictNextAssemblies(input.branch.sequenceRecords, input.previousAssemblyIds)) {
    predictions.push({
      id: `prediction_sequence_${prediction.predictedAssemblyId}_${input.timestamp}`,
      targetType: 'sequence',
      targetId: prediction.predictedAssemblyId,
      contextId: prediction.contextAssemblyIds.join('>') || 'root',
      confidence: prediction.confidence,
      reason: 'sequence_memory',
      createdAt: input.timestamp,
    })
  }

  for (const bridge of input.branch.bridgeRecords.slice(0, 3)) {
    if (input.currentAssemblyIds.includes(bridge.sourceAssemblyId)) {
      predictions.push({
        id: `prediction_bridge_${bridge.id}_${input.timestamp}`,
        targetType: 'bridge',
        targetId: bridge.id,
        contextId: bridge.sourceAssemblyId,
        confidence: Math.max(0.2, bridge.confidence),
        reason: 'bridge_follow_up',
        createdAt: input.timestamp,
      })
    }
  }

  for (const protoSeed of input.branch.protoSeedRecords.slice(0, 2)) {
    predictions.push({
      id: `prediction_proto_${protoSeed.protoSeedId}_${input.timestamp}`,
      targetType: 'proto_seed',
      targetId: protoSeed.protoSeedId,
      contextId: protoSeed.sourceAssemblyIds.join('>') || 'root',
      confidence: Math.max(0.2, protoSeed.stabilityScore),
      reason: 'proto_seed_reactivation',
      createdAt: input.timestamp,
    })
  }

  const topAssembly = [...input.branch.assemblyRecords]
    .sort((a, b) => b.stabilityScore - a.stabilityScore)
    .at(0)
  if (topAssembly) {
    predictions.push({
      id: `prediction_assembly_${topAssembly.assemblyId}_${input.timestamp}`,
      targetType: 'assembly',
      targetId: topAssembly.assemblyId,
      contextId: 'stable_assembly',
      confidence: Math.max(0.2, topAssembly.stabilityScore),
      reason: 'stable_assembly_return',
      createdAt: input.timestamp,
    })
  }

  return predictions.slice(0, 8)
}
