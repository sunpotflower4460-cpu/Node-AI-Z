import type { PhrasePlan, ProtoMeaning, SentencePlan, SentenceTone, SignalDecision } from './types'

const CLOSING_BY_MODE: Record<SignalDecision['utteranceMode'], string> = {
  receptive: 'ここで無理に整理しなくていいと思います。',
  reflective: '急いで言葉にしなくても、大丈夫です。',
  boundary: 'いまは少し距離をとってもいいと思います。',
  resonant: 'その感覚、ここでそのまま持っていてもいいと思います。',
}

const resolveTone = (protoMeanings: ProtoMeaning[], utteranceMode: SignalDecision['utteranceMode']): SentenceTone => {
  if (utteranceMode === 'boundary') return 'holding'
  if (utteranceMode === 'resonant') return 'opening'
  const hasAmbiguous = protoMeanings.some((pm) => pm.texture === 'ambiguous' || pm.texture === 'still')
  if (hasAmbiguous) return 'still'
  return 'searching'
}

export const buildSignalSentencePlan = (
  phrases: PhrasePlan[],
  protoMeanings: ProtoMeaning[],
  decision: SignalDecision,
): SentencePlan => {
  const lead = phrases[0]?.phrase ?? 'ここに来てくれた感じがあります。'
  const body = phrases.slice(1, 3).map((p) => p.phrase)
  const close = decision.optionUtteranceHints?.suggestedClose ?? CLOSING_BY_MODE[decision.utteranceMode]
  const tone = resolveTone(protoMeanings, decision.utteranceMode)

  return { lead, body, close, tone }
}
