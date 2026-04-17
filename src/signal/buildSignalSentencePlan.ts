import type { LexicalState } from '../lexical/types'
import type { MicroSignalState } from './packetTypes'
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
  context?: {
    lexicalState?: LexicalState
    microSignalState?: MicroSignalState
  },
): SentencePlan => {
  const lead = phrases[0]?.phrase ?? 'ここに来てくれた感じがあります。'
  const body = phrases.slice(1, 3).map((p) => p.phrase)
  const lexicalState = context?.lexicalState
  const microSignalState = context?.microSignalState

  if (lexicalState?.requestType === 'choice' && (lexicalState.optionLabels?.length ?? 0) >= 2) {
    body.unshift(`いまは「${lexicalState.optionLabels?.slice(0, 2).join('」と「')}」のあいだを見ています。`)
  } else if (lexicalState?.requestType === 'comfort') {
    body.unshift('まずは気持ちの置き場を先に整える方が近そうです。')
  } else if (lexicalState?.requestType === 'reflection') {
    body.unshift('まだ言い切れない部分をそのまま見ていてよさそうです。')
  }

  let close = decision.optionUtteranceHints?.suggestedClose ?? CLOSING_BY_MODE[decision.utteranceMode]
  if (microSignalState?.fieldTone === 'low-band') {
    close = 'いまは答えを急ぐより、この重さをそのまま支えながら見ていって大丈夫です。'
  } else if (
    microSignalState?.fieldTone === 'high-band'
    && (lexicalState?.requestType === 'advice' || lexicalState?.requestType === 'choice')
    && lexicalState.optionLabels?.[0]
  ) {
    close = decision.optionUtteranceHints?.suggestedClose ?? `いまは「${lexicalState.optionLabels[0]}」側から整理を始めてもよさそうです。`
  }
  const tone = resolveTone(protoMeanings, decision.utteranceMode)

  return { lead, body: body.slice(0, 3), close, tone }
}
