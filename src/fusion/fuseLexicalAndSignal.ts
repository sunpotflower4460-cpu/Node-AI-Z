import type { LexicalState } from '../lexical/types'
import type { MicroSignalState } from '../signal/packetTypes'
import type { FusedState } from './types'

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const uniq = (values: string[]) => [...new Set(values)]

export const fuseLexicalAndSignal = (
  lexicalState: LexicalState,
  microSignalState: MicroSignalState,
): FusedState => {
  const { dimensions, fieldTone } = microSignalState
  const integratedTensions: string[] = []
  const dominantTextures: string[] = []

  if (lexicalState.requestType === 'advice' && dimensions.heaviness >= 0.58) {
    integratedTensions.push('助言要求だが押しすぎ注意')
  }

  if ((lexicalState.optionLabels?.length ?? 0) >= 2 && dimensions.uncertainty >= 0.52) {
    integratedTensions.push('選択肢は見えているが揺れが強い')
  }

  if ((lexicalState.explicitTensions?.length ?? 0) > 0 && dimensions.fragility >= 0.56) {
    integratedTensions.push(`${lexicalState.explicitTensions?.[0]} があるが繊細さが高い`)
  }

  if (
    (lexicalState.optionLabels?.some((label) => /変|転職|休|相談/.test(label)) ?? false)
    && (dimensions.heaviness >= 0.5 || dimensions.uncertainty >= 0.5)
  ) {
    integratedTensions.push('変化欲求と不安が同居')
  }

  if ((lexicalState.requestType === 'comfort' || lexicalState.requestType === 'reflection') && dimensions.openness <= 0.42) {
    integratedTensions.push('受け止め優先でまだ押し広げすぎない')
  }

  if (lexicalState.explicitQuestion && dimensions.openness >= 0.58 && dimensions.clarity >= 0.54) {
    integratedTensions.push('問いは明確で比較整理へ進みやすい')
  }

  if (dimensions.heaviness >= 0.56) dominantTextures.push('重い')
  if (dimensions.fragility >= 0.56 || dimensions.tension >= 0.54) dominantTextures.push('揺れる')
  if (dimensions.openness <= 0.4) dominantTextures.push('少し閉じている')
  if (dimensions.answerPressure >= 0.5) dominantTextures.push('押されている')
  if (dimensions.uncertainty >= 0.58) dominantTextures.push('まだ定まらない')
  if (dimensions.resonance >= 0.58 && dimensions.openness >= 0.5) dominantTextures.push('少し開いている')

  if (dominantTextures.length === 0) {
    dominantTextures.push(
      fieldTone === 'low-band'
        ? '静かに重い'
        : fieldTone === 'high-band'
          ? 'ほどよく開いている'
          : '揺れを保っている',
    )
  }

  const lexicalConfidence = clamp(
    (lexicalState.explicitQuestion ? 0.18 : 0)
    + (lexicalState.requestType ? 0.18 : 0)
    + Math.min(0.18, (lexicalState.optionLabels?.length ?? 0) * 0.08)
    + Math.min(0.16, (lexicalState.explicitEntities?.length ?? 0) * 0.06)
    + Math.min(0.14, (lexicalState.explicitTensions?.length ?? 0) * 0.07),
  )
  const signalConfidence = clamp(
    0.16
    + dimensions.clarity * 0.24
    + (1 - dimensions.uncertainty) * 0.18
    + dimensions.purposeCoherence * 0.16
    + dimensions.resonance * 0.12
    + dimensions.agency * 0.1
    - dimensions.drift * 0.16,
  )

  return {
    lexicalState,
    microSignalState,
    integratedTensions: uniq(integratedTensions).slice(0, 4),
    dominantTextures: uniq(dominantTextures).slice(0, 4),
    fusedConfidence: clamp(0.2 + lexicalConfidence * 0.45 + signalConfidence * 0.55),
  }
}
