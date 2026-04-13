import { PLASTICITY_LIMITS, clampNumber, clampPlasticityValue, createDefaultPlasticityState } from './defaultPlasticityState'
import type { HomeCheckReason } from '../types/nodeStudio'
import type { PlasticityState } from './types'

const ensurePlasticity = (plasticity?: PlasticityState) => plasticity ?? createDefaultPlasticityState()
const GENTLENESS_TAIL_THRESHOLD = 0.035

export const buildRelationBoostKey = (source: string, target: string) => `${source}->${target}`

export const applyRelationBoost = (weight: number, relationKey: string, plasticity?: PlasticityState) => {
  const safePlasticity = ensurePlasticity(plasticity)
  const boost = clampPlasticityValue(safePlasticity.relationBoosts[relationKey] ?? 0, PLASTICITY_LIMITS.relation)
  return clampNumber(weight + boost, 0, 0.99)
}

export const applyPatternBoost = (score: number, patternKey: string, plasticity?: PlasticityState) => {
  const safePlasticity = ensurePlasticity(plasticity)
  const boost = clampPlasticityValue(safePlasticity.patternBoosts[patternKey] ?? 0, PLASTICITY_LIMITS.pattern)
  return clampNumber(score + boost, 0, 0.99)
}

export const getHomeTriggerThresholds = (plasticity?: PlasticityState) => {
  const safePlasticity = ensurePlasticity(plasticity)
  const overperformanceBoost = clampPlasticityValue(safePlasticity.homeTriggerBoosts.overperformance ?? 0, PLASTICITY_LIMITS.homeTrigger)
  const ambiguityBoost = clampPlasticityValue(safePlasticity.homeTriggerBoosts.ambiguity_overload ?? 0, PLASTICITY_LIMITS.homeTrigger)
  const fragilityBoost = clampPlasticityValue(safePlasticity.homeTriggerBoosts.fragility ?? 0, PLASTICITY_LIMITS.homeTrigger)
  const trustDropBoost = clampPlasticityValue(safePlasticity.homeTriggerBoosts.trust_drop ?? 0, PLASTICITY_LIMITS.homeTrigger)

  return {
    overperformance: clampNumber(0.72 - overperformanceBoost, 0.58, 0.82),
    ambiguityOverload: clampNumber(0.8 - ambiguityBoost, 0.68, 0.9),
    fragility: clampNumber(0.72 - fragilityBoost, 0.58, 0.82),
    trustDrop: clampNumber(0.45 + trustDropBoost, 0.35, 0.58),
  }
}

// Ordered replacements are intentional so stronger softening rules can refine earlier wording.
const replaceTone = (text: string, replacements: Array<[RegExp, string]>) => replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text)

const normalizeWhitespace = (text: string) => text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

const GENTLE_TAIL_BY_REASON: Record<HomeCheckReason, string> = {
  none: '',
  overperformance: 'ここでは、少しやわらかいままでいて大丈夫です。',
  hostile_input: 'ここでは、少しやわらかいままでいて大丈夫です。',
  ambiguity_overload: 'ここでは、少しやわらかいままでいて大丈夫です。',
  fragility: 'ここでは、少しやわらかくそのままで大丈夫です。',
  trust_drop: 'ここでは、少しやわらかいままでいて大丈夫です。',
}

const addGentlenessTail = (text: string, reason: HomeCheckReason) => {
  const gentleTail = GENTLE_TAIL_BY_REASON[reason]
  if (!gentleTail) {
    return text
  }

  if (text.includes(gentleTail)) {
    return text
  }

  return `${text}\n${gentleTail}`
}

export const applyToneBiases = (
  text: string,
  reason: HomeCheckReason,
  plasticity?: PlasticityState,
) => {
  const safePlasticity = ensurePlasticity(plasticity)
  const overExplainingBias = clampPlasticityValue(safePlasticity.toneBiases.over_explaining ?? 0, PLASTICITY_LIMITS.tone)
  const certaintyBias = clampPlasticityValue(safePlasticity.toneBiases.certainty ?? 0, PLASTICITY_LIMITS.tone)
  const gentlenessBias = clampPlasticityValue(safePlasticity.toneBiases.gentleness ?? 0, PLASTICITY_LIMITS.tone)

  let adjusted = text

  if (certaintyBias < -0.01) {
    adjusted = replaceTone(adjusted, [
      [/です。/g, 'かもしれません。'],
      [/ます。/g, 'る感じもあります。'],
      [/よさそうです。/g, 'よさそうな気もします。'],
    ])
  }

  if (overExplainingBias < -0.01) {
    adjusted = replaceTone(adjusted, [
      [/意味を急いで決めるより、/g, '意味を急がず、'],
      [/先に意味を決めるより、/g, 'いまは、'],
      [/整えるより先に、/g, 'いまは、'],
      [/ただ迷っているというより、/g, 'ただ迷いだけではなく、'],
      [/一時的な不安というより、/g, '一時的な不安だけではなく、'],
    ])
  }

  if (gentlenessBias > 0.01) {
    adjusted = replaceTone(adjusted, [
      [/急いで/g, '無理に急いで'],
      [/立て直さなくても/g, '立て直そうとしなくても'],
      [/決めなくても/g, '決めようとしなくても'],
    ])

    if (gentlenessBias > GENTLENESS_TAIL_THRESHOLD) {
      adjusted = addGentlenessTail(adjusted, reason)
    }
  }

  return normalizeWhitespace(adjusted)
}
