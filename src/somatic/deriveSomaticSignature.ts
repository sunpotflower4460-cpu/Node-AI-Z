import type { ProtoMeaning } from '../meaning/types'
import type { StateVector } from '../types/nodeStudio'
import type { SomaticSignature } from './types'

type Band = 'low' | 'mid' | 'high'

const toBand = (value: number): Band => {
  if (value <= 0.33) return 'low'
  if (value <= 0.66) return 'mid'
  return 'high'
}

export const deriveSomaticSignature = (
  sensoryMeanings: ProtoMeaning[],
  narrativeMeanings: ProtoMeaning[],
  field: StateVector,
): SomaticSignature => {
  const sortedSensory = [...sensoryMeanings].sort((a, b) => b.strength - a.strength)
  const sortedNarrative = [...narrativeMeanings].sort((a, b) => b.strength - a.strength)

  return {
    sensoryIds: sortedSensory.slice(0, 4).slice(0, Math.max(2, sortedSensory.length)).map((m) => m.id),
    narrativeIds: sortedNarrative.slice(0, 3).slice(0, Math.max(1, sortedNarrative.length)).map((m) => m.id),
    fieldShape: {
      closenessBand: toBand(field.relation),
      fragilityBand: toBand(field.fragility),
      urgencyBand: toBand(field.urgency),
      answerPressureBand: toBand(field.ambiguity),
    },
  }
}
