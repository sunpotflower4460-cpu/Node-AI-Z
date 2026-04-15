import { clampNumber } from '../revision/defaultPlasticityState'
import type { CoActivationResult, EmergentBinding, RelationalField } from './types'

const getValue = (nodes: CoActivationResult['otherActivations'] | CoActivationResult['selfActivations'] | CoActivationResult['beliefActivations'], id: string) =>
  nodes.find((node) => node.id === id)?.value ?? 0

export const bindEmergences = (
  coActivation: CoActivationResult,
  field: RelationalField,
): EmergentBinding[] => {
  const bindings: EmergentBinding[] = []
  const ambiguity = getValue(coActivation.otherActivations, 'ambiguity')
  const fatigue = getValue(coActivation.otherActivations, 'fatigue')
  const wantingChange = getValue(coActivation.otherActivations, 'wanting_change')
  const loneliness = getValue(coActivation.otherActivations, 'loneliness')
  const careResponse = getValue(coActivation.selfActivations, 'care_response')
  const stayWithUnknown = getValue(coActivation.selfActivations, 'stay_with_unknown')
  const keepConnection = getValue(coActivation.selfActivations, 'keep_connection')
  const truthWithoutForce = getValue(coActivation.beliefActivations, 'wanting_truth_without_force')
  const protectingAliveness = getValue(coActivation.beliefActivations, 'protecting_aliveness')
  const noFalseBrightness = getValue(coActivation.beliefActivations, 'not_wanting_false_brightness')

  if (fatigue > 0 && careResponse > 0) {
    bindings.push({
      id: 'emergence_fatigue_care',
      source: 'other:fatigue_signal',
      target: 'self:care_response',
      kind: 'care',
      weight: clampNumber((fatigue + careResponse) / 2, 0, 0.99),
      clarity: field.ambiguity > 0.7 ? 'ambiguous' : 'clear',
      reasons: ['相手の疲れに、自分側のケア反応が同時に立った'],
      pathwayKey: 'other:fatigue_signal->self:care_response',
    })
  }

  if (ambiguity > 0 && stayWithUnknown > 0) {
    bindings.push({
      id: 'emergence_ambiguity_open_hold',
      source: 'other:ambiguity',
      target: 'self:stay_with_unknown',
      kind: 'resonance',
      weight: clampNumber((ambiguity + stayWithUnknown) / 2, 0, 0.99),
      clarity: 'ambiguous',
      reasons: ['分からなさに対して、急がず持つ反応が結びついた'],
    })
  }

  if (wantingChange > 0 && truthWithoutForce > 0) {
    bindings.push({
      id: 'emergence_change_truth',
      source: 'other:wanting_change',
      target: 'belief:wanting_truth_without_force',
      kind: 'tension',
      weight: clampNumber((wantingChange + truthWithoutForce) / 2, 0, 0.99),
      clarity: field.answerPressure > 0.58 ? 'clear' : 'ambiguous',
      reasons: ['変わりたい力と、押しつけない真実志向がぶつかりながら並んだ'],
    })
  }

  if (loneliness > 0 && keepConnection > 0) {
    bindings.push({
      id: 'emergence_loneliness_connection',
      source: 'other:loneliness',
      target: 'self:keep_connection',
      kind: 'care',
      weight: clampNumber((loneliness + keepConnection) / 2, 0, 0.99),
      clarity: field.closeness > 0.6 ? 'clear' : 'ambiguous',
      reasons: ['切れたくない感じが場の近さを支えた'],
    })
  }

  if (protectingAliveness > 0 && noFalseBrightness > 0) {
    bindings.push({
      id: 'emergence_fragility_restraint',
      source: 'belief:protecting_aliveness',
      target: 'belief:not_wanting_false_brightness',
      kind: 'restraint',
      weight: clampNumber((protectingAliveness + noFalseBrightness + field.fragility) / 3, 0, 0.99),
      clarity: 'ambiguous',
      reasons: ['守りたい気持ちが、明るさで覆わない restraint を呼んだ'],
      pathwayKey: 'belief:protecting_aliveness->field:fragility',
    })
  }

  return bindings.sort((left, right) => right.weight - left.weight)
}
