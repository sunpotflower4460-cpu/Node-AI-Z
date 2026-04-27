import type { SignalPlasticityRecord } from './signalPlasticityTypes'

export function decayTimescaleWeights(
  records: SignalPlasticityRecord[],
  now: number,
): SignalPlasticityRecord[] {
  return records.map(record => {
    const elapsed = Math.max(0, now - record.weights.lastUpdatedAt)
    const decayFactor = Math.min(1, elapsed / 10_000)

    return {
      ...record,
      weights: {
        shortTerm: Math.max(0, record.weights.shortTerm - 0.18 * decayFactor),
        midTerm: Math.max(0, record.weights.midTerm - 0.08 * decayFactor),
        longTerm: Math.max(0, record.weights.longTerm - 0.02 * decayFactor),
        lastUpdatedAt: now,
      },
    }
  })
}
