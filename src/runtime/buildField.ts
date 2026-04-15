import { clampNumber } from '../revision/defaultPlasticityState'
import type { PlasticityState } from '../revision/types'
import type { CoActivationResult, HomeReturnResult, RelationalField } from './types'

const getValue = (nodes: CoActivationResult['otherActivations'] | CoActivationResult['selfActivations'] | CoActivationResult['beliefActivations'], id: string) =>
  nodes.find((node) => node.id === id)?.value ?? 0

const getPathwayBoost = (plasticity: PlasticityState | undefined, key: string) => plasticity?.pathwayBoosts[key] ?? 0

export const buildField = (
  coActivation: CoActivationResult,
  homeReturn: HomeReturnResult,
  plasticity?: PlasticityState,
): RelationalField => {
  const fatigue = getValue(coActivation.otherActivations, 'fatigue')
  const ambiguityOther = getValue(coActivation.otherActivations, 'ambiguity')
  const loneliness = getValue(coActivation.otherActivations, 'loneliness')
  const selfDoubt = getValue(coActivation.otherActivations, 'self_doubt')
  const wantingChange = getValue(coActivation.otherActivations, 'wanting_change')
  const careResponse = getValue(coActivation.selfActivations, 'care_response')
  const stayWithUnknown = getValue(coActivation.selfActivations, 'stay_with_unknown')
  const keepConnection = getValue(coActivation.selfActivations, 'keep_connection')
  const resistPerformance = getValue(coActivation.selfActivations, 'resist_performance')
  const protectingAliveness = getValue(coActivation.beliefActivations, 'protecting_aliveness')
  const truthWithoutForce = getValue(coActivation.beliefActivations, 'wanting_truth_without_force')
  const noFalseBrightness = getValue(coActivation.beliefActivations, 'not_wanting_false_brightness')

  const fragility = clampNumber(
    0.24
    + fatigue * 0.28
    + selfDoubt * 0.26
    + loneliness * 0.18
    + protectingAliveness * 0.16
    + getPathwayBoost(plasticity, 'belief:protecting_aliveness->field:fragility'),
    0,
    1,
  )
  const ambiguity = clampNumber(0.18 + ambiguityOther * 0.46 + stayWithUnknown * 0.16 + truthWithoutForce * 0.08, 0, 1)
  const closeness = clampNumber(0.42 + careResponse * 0.18 + keepConnection * 0.18 + homeReturn.homeState.belongingSignal * 0.1, 0, 1)
  const urgency = clampNumber(0.2 + wantingChange * 0.18 + coActivation.questionSignal * 0.16 - homeReturn.vector.permissionToBe * 0.12 - resistPerformance * 0.08, 0, 1)
  const permission = clampNumber(0.42 + homeReturn.vector.permissionToBe * 0.28 + stayWithUnknown * 0.1, 0, 1)
  const gravity = clampNumber(0.24 + fatigue * 0.28 + selfDoubt * 0.18 + loneliness * 0.14 + noFalseBrightness * 0.08, 0, 1)
  const answerPressure = clampNumber(0.18 + coActivation.questionSignal * 0.3 + wantingChange * 0.16 - permission * 0.12 - stayWithUnknown * 0.08, 0, 1)
  const stayWithNotKnowing = clampNumber(ambiguity * 0.72 + truthWithoutForce * 0.14 + getPathwayBoost(plasticity, 'field:ambiguity->stance:stay_open'), 0, 1)
  const distance = clampNumber(0.58 - closeness * 0.24 + fragility * 0.08, 0, 1)

  const stateVector = {
    fragility,
    urgency,
    depth: clampNumber((gravity + ambiguity + stayWithNotKnowing) / 3, 0, 1),
    care: clampNumber((closeness + careResponse + protectingAliveness) / 3, 0, 1),
    agency: clampNumber(0.56 - fragility * 0.22 - ambiguity * 0.12 + wantingChange * 0.12, 0, 1),
    ambiguity,
    change: clampNumber(0.18 + wantingChange * 0.64, 0, 1),
    stability: clampNumber(0.64 - urgency * 0.22 + permission * 0.1, 0, 1),
    self: clampNumber((careResponse + stayWithUnknown + resistPerformance) / 3, 0, 1),
    relation: closeness,
    light: clampNumber(0.48 - gravity * 0.18 + permission * 0.14, 0, 1),
    heaviness: gravity,
  }

  let atmosphere = 'まだ決めきらない方が自然な場'
  if (fragility > 0.72) atmosphere = '押しすぎると壊れやすい、近さに気を配る場'
  else if (answerPressure > 0.62 && wantingChange > 0.45) atmosphere = '答えを求める力と、急がない方がよい力が同時にある場'
  else if (closeness > 0.66) atmosphere = '距離を詰めすぎずに近くにいてよい場'

  return {
    gravity,
    closeness,
    urgency,
    fragility,
    permission,
    ambiguity,
    distance,
    answerPressure,
    stayWithNotKnowing,
    stateVector,
    atmosphere,
    debugNotes: ['Field formation started', `Field atmosphere: ${atmosphere}`],
  }
}
