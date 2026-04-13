import { PLASTICITY_LIMITS, clampPlasticityValue, createDefaultPlasticityState } from './defaultPlasticityState'
import type { ChangeStatus, PlasticityState, ProposedChange, RevisionState } from './types'

const STATUS_WEIGHTS: Record<ChangeStatus, number> = {
  ephemeral: 0.35,
  provisional: 0.6,
  promoted: 1,
  reverted: 0,
}

const KIND_LIMITS = {
  relation_weight: PLASTICITY_LIMITS.relation,
  pattern_weight: PLASTICITY_LIMITS.pattern,
  home_trigger: PLASTICITY_LIMITS.homeTrigger,
  tone_bias: PLASTICITY_LIMITS.tone,
} as const

const getTuningMultiplier = (changeId: string, tuning: RevisionState['tuning']) => {
  if (tuning.reverted.has(changeId)) return 0
  if (tuning.locked.has(changeId)) return 1
  if (tuning.softened.has(changeId)) return 0.5
  if (tuning.kept.has(changeId)) return 0.6
  return 1
}

const applyChangeToMap = (target: Record<string, number>, key: string, delta: number, limit: number) => {
  target[key] = clampPlasticityValue((target[key] ?? 0) + delta, limit)
}

const applyChangeToPlasticity = (plasticity: PlasticityState, change: ProposedChange, delta: number) => {
  switch (change.kind) {
    case 'relation_weight':
      applyChangeToMap(plasticity.relationBoosts, change.key, delta, KIND_LIMITS.relation_weight)
      break
    case 'pattern_weight':
      applyChangeToMap(plasticity.patternBoosts, change.key, delta, KIND_LIMITS.pattern_weight)
      break
    case 'home_trigger':
      applyChangeToMap(plasticity.homeTriggerBoosts, change.key, delta, KIND_LIMITS.home_trigger)
      break
    case 'tone_bias':
      applyChangeToMap(plasticity.toneBiases, change.key, delta, KIND_LIMITS.tone_bias)
      break
  }
}

export const getRevisionChangeInfluence = (change: ProposedChange, state: RevisionState): number => {
  const statusWeight = STATUS_WEIGHTS[change.status]
  const tuningWeight = getTuningMultiplier(change.id, state.tuning)
  const delta = change.delta * statusWeight * tuningWeight
  return clampPlasticityValue(delta, KIND_LIMITS[change.kind])
}

export const rebuildPlasticityState = (state: RevisionState): PlasticityState => {
  const plasticity = createDefaultPlasticityState()

  state.memory.entries.forEach((entry) => {
    entry.proposedChanges.forEach((change) => {
      const delta = getRevisionChangeInfluence(change, state)
      if (delta !== 0) {
        applyChangeToPlasticity(plasticity, change, delta)
      }
    })
  })

  plasticity.lastUpdated = new Date().toISOString()
  return plasticity
}
