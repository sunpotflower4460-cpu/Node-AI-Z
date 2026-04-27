import type { MultiTimescaleWeight } from './signalPlasticityTypes'

export function computeEffectiveSignalWeight(weight: MultiTimescaleWeight): number {
  return Math.max(
    0,
    Math.min(1, weight.shortTerm * 0.25 + weight.midTerm * 0.35 + weight.longTerm * 0.4),
  )
}
