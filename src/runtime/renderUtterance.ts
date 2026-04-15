import { applyReturnAdjustment } from '../home/homeLayer'
import type { CoActivationResult, CrystallizedUtterance, HomeReturnResult, MeaningRiseResult, RelationalField, SelfDecision } from './types'

const getValue = (nodes: CoActivationResult['otherActivations'] | CoActivationResult['selfActivations'] | CoActivationResult['beliefActivations'], id: string) =>
  nodes.find((node) => node.id === id)?.value ?? 0

const joinParts = (parts: Array<string | null | undefined>) => parts.filter((part): part is string => Boolean(part?.trim())).join('\n')

const buildReactionLine = (coActivation: CoActivationResult, field: RelationalField) => {
  const fatigue = getValue(coActivation.otherActivations, 'fatigue')
  const ambiguity = getValue(coActivation.otherActivations, 'ambiguity')
  const loneliness = getValue(coActivation.otherActivations, 'loneliness')
  const wantingChange = getValue(coActivation.otherActivations, 'wanting_change')
  const safety = getValue(coActivation.otherActivations, 'safety')

  if (fatigue > 0.46) return 'かなり削られたまま、ここに来ている感じがあります。'
  if (ambiguity > 0.48) return 'まだ言葉になる手前のまま、ここにある感じがあります。'
  if (wantingChange > 0.42 && safety > 0.36) return '変わりたい気持ちと、すぐには寄せ切れない感じが同時にあります。'
  if (loneliness > 0.4) return 'ちゃんと切られずに受け取ってほしい気配があります。'
  if (field.fragility > 0.68) return '少し強く触れると揺れそうな場になっています。'
  return 'いくつかの感じが、まだ重なったままあります。'
}

const buildCoreLine = (decision: SelfDecision, meaningRise: MeaningRiseResult) => {
  if (decision.shouldStayOpen) {
    return `いまは ${meaningRise.coreMeaning} を急いで決めない方が近そうです。`
  }

  if (decision.replyIntent === 'protect_before_answer') {
    return `先に守りたいのは、${meaningRise.coreMeaning} の方です。`
  }

  return `いま中心に近いのは、${meaningRise.coreMeaning} だと思います。`
}

const buildAnswerLine = (coActivation: CoActivationResult, decision: SelfDecision) => {
  if (!decision.shouldAnswerQuestion) {
    return null
  }

  const wantingChange = getValue(coActivation.otherActivations, 'wanting_change')
  const safety = getValue(coActivation.otherActivations, 'safety')
  const fatigue = getValue(coActivation.otherActivations, 'fatigue')

  if (wantingChange > 0.42 && safety > 0.36) {
    return '答えをひとつに急ぐより、変わりたい気持ちと怖さの両方を残したまま見た方がよさそうです。'
  }
  if (fatigue > 0.46) {
    return 'いまは正しさを出すより、どこで削られているのかを見失わない方が先かもしれません。'
  }

  return 'すぐに結論へ寄せるより、いま動いているものを先に確かめる方が自然そうです。'
}

const buildNextStep = (decision: SelfDecision, field: RelationalField) => {
  if (decision.answerDepth === 'light') {
    return field.permission > 0.58 ? '必要なら、このまま一番重いところから少しずつ見ていけます。' : null
  }

  return '続けるなら、いま一番削られているところから置いてみてください。'
}

export const renderUtterance = (
  coActivation: CoActivationResult,
  field: RelationalField,
  meaningRise: MeaningRiseResult,
  decision: SelfDecision,
  homeReturn: HomeReturnResult,
): CrystallizedUtterance => {
  const rawUtterance = joinParts([
    buildReactionLine(coActivation, field),
    buildCoreLine(decision, meaningRise),
    buildAnswerLine(coActivation, decision),
    buildNextStep(decision, field),
  ])

  const utterance = applyReturnAdjustment(rawUtterance, homeReturn.homeCheck)

  return {
    rawUtterance,
    utterance,
    debugNotes: ['Utterance rendered from self decision', `Utterance adjusted through home reason: ${homeReturn.homeCheck.reason}`],
  }
}
