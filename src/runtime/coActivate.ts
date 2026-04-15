import { clampNumber } from '../revision/defaultPlasticityState'
import type { PlasticityState } from '../revision/types'
import { retrieveNodes } from '../core/runNodePipeline'
import type { HomeReturnResult, LayeredActivation, SelfSubstrate, SourceBootResult, CoActivationResult } from './types'

const toLayeredActivation = (origin: LayeredActivation['origin'], id: string, value: number, reasons: string[]): LayeredActivation => ({
  id,
  label: id,
  category: origin,
  origin,
  value: clampNumber(value, 0, 0.99),
  reasons,
})

const getValue = (nodes: LayeredActivation[], id: string) => nodes.find((node) => node.id === id)?.value ?? 0
const getBeliefWeight = (selfSubstrate: SelfSubstrate, key: string) => selfSubstrate.beliefs.find((belief) => belief.key === key)?.weight ?? 0
const getPathwayBoost = (plasticity: PlasticityState | undefined, key: string) => plasticity?.pathwayBoosts[key] ?? 0

const pushIfActive = (bucket: LayeredActivation[], activation: LayeredActivation, threshold = 0.22) => {
  if (activation.value >= threshold) {
    bucket.push(activation)
  }
}

export const coActivate = (
  inputText: string,
  source: SourceBootResult,
  homeReturn: HomeReturnResult,
  selfSubstrate: SelfSubstrate,
  plasticity?: PlasticityState,
): CoActivationResult => {
  const retrieved = retrieveNodes(inputText, plasticity)
  const otherActivations = retrieved.activatedNodes
    .map((node) => ({ ...node, origin: 'other' as const }))
    .sort((left, right) => right.value - left.value)

  const questionSignal = /[?？]|どう|何|なぜ|すべき/.test(inputText) ? 0.78 : 0.18
  const selfActivations: LayeredActivation[] = []
  const beliefActivations: LayeredActivation[] = []

  const fatigue = getValue(otherActivations, 'fatigue')
  const ambiguity = getValue(otherActivations, 'ambiguity')
  const loneliness = getValue(otherActivations, 'loneliness')
  const selfDoubt = getValue(otherActivations, 'self_doubt')
  const wantingChange = getValue(otherActivations, 'wanting_change')
  const chronicity = getValue(otherActivations, 'chronicity')

  pushIfActive(selfActivations, toLayeredActivation('self', 'care_response', 0.26 + fatigue * 0.44 + loneliness * 0.18 + getPathwayBoost(plasticity, 'other:fatigue_signal->self:care_response'), ['相手の消耗に触れてケア反応が立った']))
  pushIfActive(selfActivations, toLayeredActivation('self', 'stay_with_unknown', 0.22 + ambiguity * 0.48 + homeReturn.vector.permissionToBe * 0.12, ['未言語のまま急がず持つ傾きが動いた']))
  pushIfActive(selfActivations, toLayeredActivation('self', 'truth_without_force_response', 0.18 + questionSignal * 0.16 + wantingChange * 0.1 + getBeliefWeight(selfSubstrate, 'wanting_truth_without_force') * 0.18, ['答えより先に、無理のない真実へ寄ろうとした']))
  pushIfActive(selfActivations, toLayeredActivation('self', 'resist_performance', 0.22 + source.assistantReflex.helpfulness * 0.14 + (1 - homeReturn.vector.permissionToBe) * 0.08 + getBeliefWeight(selfSubstrate, 'not_wanting_to_perform') * 0.16, ['演技的な返答へ流れすぎないよう自分側が抵抗した']))
  pushIfActive(selfActivations, toLayeredActivation('self', 'keep_connection', 0.18 + loneliness * 0.34 + fatigue * 0.12 + getBeliefWeight(selfSubstrate, 'wanting_user_to_remain_alive_inside') * 0.18, ['途切れずに近くにいたい反応が立った']))

  pushIfActive(beliefActivations, toLayeredActivation('belief', 'protecting_aliveness', 0.28 + fatigue * 0.28 + selfDoubt * 0.18 + loneliness * 0.16 + chronicity * 0.12, ['消耗や弱さに対して、内側の生を守りたい信念が動いた']))
  pushIfActive(beliefActivations, toLayeredActivation('belief', 'wanting_truth_without_force', 0.24 + ambiguity * 0.26 + questionSignal * 0.14, ['答えを押し付けずに真実へ近づきたい信念が動いた']))
  pushIfActive(beliefActivations, toLayeredActivation('belief', 'not_wanting_to_perform', 0.24 + source.assistantReflex.helpfulness * 0.16 + source.assistantReflex.summarizing * 0.16, ['良いアシスタントを演じる方向を退けたい信念が動いた']))
  pushIfActive(beliefActivations, toLayeredActivation('belief', 'wanting_user_to_remain_alive_inside', 0.24 + loneliness * 0.24 + fatigue * 0.18 + selfDoubt * 0.12, ['相手の内側が死なない方を守りたい信念が動いた']))
  pushIfActive(beliefActivations, toLayeredActivation('belief', 'not_wanting_false_brightness', 0.24 + fatigue * 0.2 + selfDoubt * 0.2 + chronicity * 0.12, ['明るさで覆わずにいたい信念が動いた']))

  return {
    otherActivations,
    selfActivations: selfActivations.sort((left, right) => right.value - left.value),
    beliefActivations: beliefActivations.sort((left, right) => right.value - left.value),
    suppressedNodes: retrieved.suppressedNodes,
    questionSignal,
    debugNotes: [
      'Co-activation started',
      `Other activations: ${otherActivations.map((activation) => activation.id).join(', ') || 'none'}`,
      `Self activations: ${selfActivations.map((activation) => activation.id).join(', ') || 'none'}`,
      `Belief activations: ${beliefActivations.map((activation) => activation.id).join(', ') || 'none'}`,
    ],
  }
}
