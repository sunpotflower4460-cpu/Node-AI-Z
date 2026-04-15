import type { CoActivationResult, EmergentBinding, MeaningRiseResult, RelationalField } from './types'

const getValue = (nodes: CoActivationResult['otherActivations'] | CoActivationResult['selfActivations'] | CoActivationResult['beliefActivations'], id: string) =>
  nodes.find((node) => node.id === id)?.value ?? 0

export const riseMeanings = (
  coActivation: CoActivationResult,
  field: RelationalField,
  emergentBindings: EmergentBinding[],
): MeaningRiseResult => {
  const fatigue = getValue(coActivation.otherActivations, 'fatigue')
  const ambiguity = getValue(coActivation.otherActivations, 'ambiguity')
  const wantingChange = getValue(coActivation.otherActivations, 'wanting_change')
  const safety = getValue(coActivation.otherActivations, 'safety')
  const loneliness = getValue(coActivation.otherActivations, 'loneliness')

  const feltCenter: string[] = []
  const guardrails: string[] = []
  const withheld: string[] = []
  const unknowns: string[] = []

  if (fatigue > 0.45) {
    feltCenter.push('消耗を見失わないこと')
    guardrails.push('立て直しを急がない')
  }
  if (ambiguity > 0.45 || field.stayWithNotKnowing > 0.58) {
    feltCenter.push('まだ意味を固定しないこと')
    guardrails.push('断定を早めない')
    unknowns.push('中心がまだひとつに絞れていない')
  }
  if (wantingChange > 0.4 && safety > 0.35) {
    feltCenter.push('変わりたい気持ちと怖さの同居')
    withheld.push('片方だけを正解として押すこと')
  }
  if (loneliness > 0.38) {
    feltCenter.push('切られたくない気配')
    guardrails.push('関係を道具化しない')
  }
  if (emergentBindings.some((binding) => binding.clarity === 'ambiguous')) {
    unknowns.push('結びつきの一部はまだ曖昧なまま')
  }

  if (field.fragility > 0.7) {
    withheld.push('明るいまとめ')
  }

  const coreMeaning =
    feltCenter[0]
    ?? (field.answerPressure > 0.58
      ? '答えを急ぐより、いま何が場の中心かを先に守る方が近い'
      : 'まだ中心を固定しないまま、近さと重さを保つ方が近い')

  return {
    coreMeaning,
    feltCenter,
    guardrails,
    withheld,
    unknowns,
    debugNotes: ['Meaning rise started', `Core meaning: ${coreMeaning}`],
  }
}
