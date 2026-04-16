import type { Signal, BoundaryLoopState } from './types'

const INTERNAL_LAYERS = new Set<Signal['layer']>(['self', 'belief'])
const EXTERNAL_LAYERS = new Set<Signal['layer']>(['other', 'field'])

const avgStrength = (signals: Signal[]): number => {
  if (signals.length === 0) return 0
  return signals.reduce((sum, s) => sum + s.strength, 0) / signals.length
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export const runBoundaryLoop = (signals: Signal[]): BoundaryLoopState => {
  const internalSignals = signals.filter((s) => INTERNAL_LAYERS.has(s.layer))
  const externalSignals = signals.filter((s) => EXTERNAL_LAYERS.has(s.layer))

  const internalAvg = avgStrength(internalSignals)
  const externalAvg = avgStrength(externalSignals)

  // Boundary tension rises when external pressure is high relative to internal grounding
  const tension = clamp(externalAvg - internalAvg * 0.5 + 0.1, 0, 1)

  return {
    internalSignals: internalSignals.sort((a, b) => b.strength - a.strength),
    externalSignals: externalSignals.sort((a, b) => b.strength - a.strength),
    boundaryTension: tension,
  }
}
