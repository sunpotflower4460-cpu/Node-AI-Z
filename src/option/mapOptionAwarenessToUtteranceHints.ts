import type { OptionAwareness, OptionDecisionShape, OptionNode, OptionUtteranceHints } from './types'

type MapOptionAwarenessToUtteranceHintsInput = {
  options: OptionNode[]
  awareness: OptionAwareness
  decision: OptionDecisionShape
}

export const mapOptionAwarenessToUtteranceHints = ({
  options,
  awareness,
  decision,
}: MapOptionAwarenessToUtteranceHintsInput): OptionUtteranceHints => {
  const optionLabels = new Map(options.map((option) => [option.id, option.label]))
  const ranked = Object.entries(awareness.optionRatios)
    .sort((left, right) => right[1] - left[1])

  const favoredOptionId = ranked[0]?.[0]
  const secondaryOptionId = ranked[1]?.[0]
  const favoredOptionLabel = favoredOptionId ? optionLabels.get(favoredOptionId) ?? favoredOptionId : undefined
  const secondaryOptionLabel = secondaryOptionId ? optionLabels.get(secondaryOptionId) ?? secondaryOptionId : undefined
  const ratioText = ranked.slice(0, 2).map(([optionId, ratio]) => `${optionLabels.get(optionId) ?? optionId} ${ratio}`).join(' / ') || undefined

  let hesitationTone: OptionUtteranceHints['hesitationTone'] = 'balanced'
  let suggestedClose = 'いまは寄り方だけを見ながら、まだ決め切らなくても大丈夫です。'
  const notes: string[] = [awareness.summaryLabel]

  if (decision.stance === 'bridge') {
    hesitationTone = 'balanced'
    suggestedClose = 'どちらか一方に急がず、間に置ける形から触れていってもよさそうです。'
    notes.push('bridge option をにじませる')
  } else if (decision.stance === 'observe') {
    hesitationTone = 'gentle_hold'
    suggestedClose = 'いまはまだ決め切らず、どちらに少し寄っているかだけ見ていても大丈夫です。'
    notes.push('迷いを保持する')
  } else if (decision.stance === 'commit' && favoredOptionLabel) {
    hesitationTone = 'forward'
    suggestedClose = `いまは「${favoredOptionLabel}」側の感覚を少し前に置いてみてもよさそうです。`
    notes.push('優勢側を前に出す')
  } else if (decision.stance === 'lean' && favoredOptionLabel) {
    hesitationTone = 'balanced'
    suggestedClose = `いまは「${favoredOptionLabel}」寄りですが、揺れを残したままでよさそうです。`
    notes.push('優勢側を薄く保つ')
  }

  return {
    favoredOptionLabel,
    secondaryOptionLabel,
    bridgeOptionSuggested: awareness.bridgeOptionPossible || decision.shouldOfferBridge,
    hesitationTone,
    ratioText,
    suggestedClose,
    notes,
  }
}
