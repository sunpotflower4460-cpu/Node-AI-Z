import type { HierarchicalPrediction, HierarchicalPredictionComparison } from './hierarchicalPredictionTypes'

export function comparePredictionWithActual(input: {
  predictions: HierarchicalPrediction[]
  actualAssemblyIds: string[]
  actualBridgeIds: string[]
  actualProtoSeedIds: string[]
}): HierarchicalPredictionComparison[] {
  return input.predictions.map(prediction => {
    const actualTargetIds =
      prediction.targetType === 'bridge'
        ? input.actualBridgeIds
        : prediction.targetType === 'proto_seed'
          ? input.actualProtoSeedIds
          : input.actualAssemblyIds
    const confirmed = actualTargetIds.includes(prediction.targetId)
    const surprise = confirmed ? 1 - prediction.confidence : prediction.confidence

    return {
      predictionId: prediction.id,
      targetType: prediction.targetType,
      targetId: prediction.targetId,
      confirmed,
      surprise,
      actualTargetIds,
      notes: confirmed
        ? ['Prediction matched current activation flow']
        : ['Prediction missed current activation flow'],
    }
  })
}
