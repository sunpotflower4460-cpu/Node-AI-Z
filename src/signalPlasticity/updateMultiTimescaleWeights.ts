import type {
  SignalPlasticityRecord,
  SignalPlasticityTargetType,
} from './signalPlasticityTypes'

const SHORT_TERM_GAIN = 0.45
const MID_TERM_GAIN_ACTIVE = 0.18
const MID_TERM_GAIN_RESTING = 0.28
const LONG_TERM_GAIN_ACTIVE = 0.08
const LONG_TERM_GAIN_RESTING = 0.16
const SHORT_TO_MID_ACTIVE = 0.02
const SHORT_TO_MID_RESTING = 0.08
const MID_TO_LONG_ACTIVE = 0.01
const MID_TO_LONG_RESTING = 0.05

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

    const shortTermGain = learning * SHORT_TERM_GAIN
    const midTermGain = learning * (input.isResting ? MID_TERM_GAIN_RESTING : MID_TERM_GAIN_ACTIVE)
    const longTermGain = learning * (input.isResting ? LONG_TERM_GAIN_RESTING : LONG_TERM_GAIN_ACTIVE)
    const shortToMidTransfer = previousWeights.shortTerm * (input.isResting ? SHORT_TO_MID_RESTING : SHORT_TO_MID_ACTIVE)
    const midToLongTransfer = previousWeights.midTerm * (input.isResting ? MID_TO_LONG_RESTING : MID_TO_LONG_ACTIVE)

    recordMap.set(key, {
      id: existing?.id ?? `plasticity_${reinforcement.targetType}_${reinforcement.targetId}`,
      targetType: reinforcement.targetType,
      targetId: reinforcement.targetId,
      reinforcementCount: (existing?.reinforcementCount ?? 0) + 1,
      weights: {
        shortTerm: Math.min(1, previousWeights.shortTerm + shortTermGain),
        midTerm: Math.min(1, previousWeights.midTerm + midTermGain + shortToMidTransfer),
        longTerm: Math.min(1, previousWeights.longTerm + longTermGain + midToLongTransfer),
        lastUpdatedAt: input.timestamp,
      },
    })
  }

  return Array.from(recordMap.values())
}
