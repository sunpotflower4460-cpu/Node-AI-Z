import type {
  SignalPlasticityRecord,
  SignalPlasticityTargetType,
} from './signalPlasticityTypes'

export type PlasticityReinforcement = {
  targetType: SignalPlasticityTargetType
  targetId: string
  intensity: number
}

export function updateMultiTimescaleWeights(input: {
  records: SignalPlasticityRecord[]
  reinforcements: PlasticityReinforcement[]
  learningRateMultiplier: number
  timestamp: number
  isResting?: boolean
}): SignalPlasticityRecord[] {
  const recordMap = new Map(
    input.records.map(record => [`${record.targetType}:${record.targetId}`, record]),
  )

  for (const reinforcement of input.reinforcements) {
    const key = `${reinforcement.targetType}:${reinforcement.targetId}`
    const existing = recordMap.get(key)
    const learning = Math.max(0.02, reinforcement.intensity * input.learningRateMultiplier)
    const previousWeights = existing?.weights ?? {
      shortTerm: 0,
      midTerm: 0,
      longTerm: 0,
      lastUpdatedAt: input.timestamp,
    }

    const shortTermGain = learning * 0.45
    const midTermGain = learning * (input.isResting ? 0.28 : 0.18)
    const longTermGain = learning * (input.isResting ? 0.16 : 0.08)

    recordMap.set(key, {
      id: existing?.id ?? `plasticity_${reinforcement.targetType}_${reinforcement.targetId}`,
      targetType: reinforcement.targetType,
      targetId: reinforcement.targetId,
      reinforcementCount: (existing?.reinforcementCount ?? 0) + 1,
      weights: {
        shortTerm: Math.min(1, previousWeights.shortTerm + shortTermGain),
        midTerm: Math.min(1, previousWeights.midTerm + midTermGain + previousWeights.shortTerm * (input.isResting ? 0.08 : 0.02)),
        longTerm: Math.min(1, previousWeights.longTerm + longTermGain + previousWeights.midTerm * (input.isResting ? 0.05 : 0.01)),
        lastUpdatedAt: input.timestamp,
      },
    })
  }

  return Array.from(recordMap.values())
}
