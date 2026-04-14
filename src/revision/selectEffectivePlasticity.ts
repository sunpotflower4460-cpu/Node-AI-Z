import { PLASTICITY_LIMITS, clampPlasticityValue } from './defaultPlasticityState'
import { buildRelationBoostKey } from './applyPlasticity'
import type { Binding, CoreNode, LiftedPattern } from '../types/nodeStudio'
import type { PlasticityState } from './types'

export type AppliedBoostEntry = {
  kind: 'node' | 'relation' | 'pattern' | 'home_trigger'
  key: string
  delta: number
  label: string
}

const MIN_BOOST_THRESHOLD = 0.001

export const selectEffectivePlasticity = (
  activatedNodes: CoreNode[],
  bindings: Binding[],
  liftedPatterns: LiftedPattern[],
  plasticity?: PlasticityState,
): AppliedBoostEntry[] => {
  if (!plasticity) return []

  const applied: AppliedBoostEntry[] = []

  activatedNodes.forEach((node) => {
    const delta = clampPlasticityValue(plasticity.nodeBoosts[node.id] ?? 0, PLASTICITY_LIMITS.node)
    if (Math.abs(delta) > MIN_BOOST_THRESHOLD) {
      applied.push({
        kind: 'node',
        key: node.id,
        delta,
        label: `Node boost applied: ${node.id} activation ${delta > 0 ? '+' : ''}${delta.toFixed(3)}`,
      })
    }
  })

  bindings.forEach((binding) => {
    const key = buildRelationBoostKey(binding.source, binding.target)
    const delta = clampPlasticityValue(plasticity.relationBoosts[key] ?? 0, PLASTICITY_LIMITS.relation)
    if (Math.abs(delta) > MIN_BOOST_THRESHOLD) {
      applied.push({
        kind: 'relation',
        key,
        delta,
        label: `Plasticity applied: relation ${key} ${delta > 0 ? '+' : ''}${delta.toFixed(3)}`,
      })
    }
  })

  liftedPatterns.forEach((pattern) => {
    const delta = clampPlasticityValue(plasticity.patternBoosts[pattern.id] ?? 0, PLASTICITY_LIMITS.pattern)
    if (Math.abs(delta) > MIN_BOOST_THRESHOLD) {
      applied.push({
        kind: 'pattern',
        key: pattern.id,
        delta,
        label: `Pattern boost applied: ${pattern.id} ${delta > 0 ? '+' : ''}${delta.toFixed(3)}`,
      })
    }
  })

  Object.entries(plasticity.homeTriggerBoosts).forEach(([key, raw]) => {
    const delta = clampPlasticityValue(raw, PLASTICITY_LIMITS.homeTrigger)
    if (Math.abs(delta) > MIN_BOOST_THRESHOLD) {
      applied.push({
        kind: 'home_trigger',
        key,
        delta,
        label: `Home trigger adjusted: ${key} sensitivity ${delta > 0 ? '+' : ''}${delta.toFixed(3)}`,
      })
    }
  })

  return applied
}
