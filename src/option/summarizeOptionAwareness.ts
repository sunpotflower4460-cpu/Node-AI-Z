import type { OptionAwareness, OptionCompetitionResult, OptionNode } from './types'

type SummarizeOptionAwarenessInput = {
  options: OptionNode[]
  competition: OptionCompetitionResult
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const toPercentRatios = (weights: Array<{ optionId: string; weight: number }>) => {
  const total = weights.reduce((sum, entry) => sum + entry.weight, 0)
  if (total <= 0) {
    return Object.fromEntries(weights.map((entry) => [entry.optionId, 0]))
  }

  const raw = weights.map((entry) => ({
    optionId: entry.optionId,
    value: Math.round((entry.weight / total) * 100),
  }))

  const diff = 100 - raw.reduce((sum, entry) => sum + entry.value, 0)
  if (raw.length > 0 && diff !== 0) {
    raw[0].value += diff
  }

  return Object.fromEntries(raw.map((entry) => [entry.optionId, entry.value]))
}

export const summarizeOptionAwareness = ({
  options,
  competition,
}: SummarizeOptionAwarenessInput): OptionAwareness => {
  if (competition.optionFields.length === 0) {
    return {
      optionRatios: {},
      differenceMagnitude: 0,
      hesitationStrength: 0,
      bridgeOptionPossible: false,
      confidence: 0,
      summaryLabel: '選択肢はまだ立ち上がっていない',
    }
  }

  const optionLabels = new Map(options.map((option) => [option.id, option.label]))
  const ratioWeights = competition.optionFields.map((field) => ({
    optionId: field.optionId,
    weight: Math.max(0.05, field.netPull + 0.35 + field.totalSupport * 0.25),
  }))
  const optionRatios = toPercentRatios(ratioWeights)

  const sorted = competition.optionFields
    .map((field) => ({ ...field, ratio: optionRatios[field.optionId] ?? 0 }))
    .sort((left, right) => right.ratio - left.ratio)

  const first = sorted[0]
  const second = sorted[1]
  const differenceMagnitude = second ? Math.abs(first.ratio - second.ratio) / 100 : first.ratio / 100
  const averageResistance = competition.optionFields.reduce((sum, field) => sum + field.totalResistance, 0) / competition.optionFields.length
  const hesitationStrength = clamp((1 - differenceMagnitude) * 0.58 + averageResistance * 0.42)
  const bridgeOptionPossible = Boolean(
    second
    && differenceMagnitude < 0.18
    && averageResistance < 0.62
    && first.totalSupport > first.totalResistance
    && second.totalSupport > second.totalResistance,
  )
  const confidence = clamp((first.ratio / 100) * 0.56 + (1 - hesitationStrength) * 0.44)

  let summaryLabel = 'まだ割り切れていない'
  if (bridgeOptionPossible) {
    summaryLabel = '中間案がありそう'
  } else if (hesitationStrength > 0.72 && second) {
    summaryLabel = 'かなり拮抗している'
  } else if (first && second && differenceMagnitude < 0.16) {
    summaryLabel = `${optionLabels.get(first.optionId) ?? first.optionId}寄りだが迷いあり`
  } else if (first) {
    summaryLabel = `${optionLabels.get(first.optionId) ?? first.optionId}寄り`
  }

  return {
    optionRatios,
    dominantOptionId: competition.dominantOptionId ?? first?.optionId,
    differenceMagnitude,
    hesitationStrength,
    bridgeOptionPossible,
    confidence,
    summaryLabel,
  }
}
