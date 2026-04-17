import type { Signal, CoFiringGroup, SignalField } from './types'

const CO_FIRING_THRESHOLD = 0.45
const COHESION_LAYER_BONUS = 0.15
const MIN_CO_FIRING_GROUP_SIZE = 2
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const computeCohesion = (signals: Signal[]): number => {
  if (signals.length < 2) return 0
  const avgStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length
  // Same-layer signals add cohesion
  const layerCounts = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.layer] = (acc[s.layer] ?? 0) + 1
    return acc
  }, {})
  const maxSameLayer = Math.max(...Object.values(layerCounts))
  const layerBonus = maxSameLayer > 1 ? COHESION_LAYER_BONUS : 0
  return clamp(avgStrength + layerBonus, 0, 1)
}

export const buildSignalField = (signals: Signal[]): SignalField => {
  const activeSignals = signals.filter((s) => s.strength >= CO_FIRING_THRESHOLD)

  // Group signals into co-firing groups based on layer proximity and strength
  const groups: CoFiringGroup[] = []

  // Group by layer first
  const byLayer = new Map<Signal['layer'], Signal[]>()
  for (const signal of activeSignals) {
    const existing = byLayer.get(signal.layer) ?? []
    byLayer.set(signal.layer, [...existing, signal])
  }

  for (const [, layerSignals] of byLayer) {
    if (layerSignals.length === 0) continue
    groups.push({
      signalIds: layerSignals.map((s) => s.id),
      cohesion: computeCohesion(layerSignals),
    })
  }

  // Cross-layer group: self + belief (internal)
  const selfSignals = activeSignals.filter((s) => s.layer === 'self' || s.layer === 'belief')
  if (selfSignals.length >= 2) {
    groups.push({
      signalIds: selfSignals.map((s) => s.id),
      cohesion: computeCohesion(selfSignals),
    })
  }

  // Cross-layer group: other + field (external)
  const externalSignals = activeSignals.filter((s) => s.layer === 'other' || s.layer === 'field')
  if (externalSignals.length >= 2) {
    groups.push({
      signalIds: externalSignals.map((s) => s.id),
      cohesion: computeCohesion(externalSignals),
    })
  }

  const uniqueGroups = groups.filter((g) => g.signalIds.length >= MIN_CO_FIRING_GROUP_SIZE)
  const fieldIntensity =
    activeSignals.length > 0
      ? clamp(activeSignals.reduce((sum, s) => sum + s.strength, 0) / activeSignals.length, 0, 1)
      : 0.1

  return {
    signals: activeSignals,
    coFiringGroups: uniqueGroups,
    fieldIntensity,
  }
}
