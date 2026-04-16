import type { CoreNode, StateVector } from '../types/nodeStudio'
import type { ProtoMeaning } from './types'

type PredictionErrorSummary = {
  overallSurprise?: number
  featureIds?: string[]
}

type NarrativeProtoMeaningInput = {
  sensoryProtoMeanings: ProtoMeaning[]
  nodes: CoreNode[]
  field: StateVector
  predictionErrorSummary?: PredictionErrorSummary
}

type NarrativeRule = {
  id: string
  glossJa: string
  toneTags: string[]
  score: (ctx: RuleContext) => number
  childGlosses: string[]
  sourceNodeIds: (ctx: RuleContext) => string[]
}

type RuleContext = {
  sensoryMap: Map<string, ProtoMeaning>
  nodeMap: Map<string, CoreNode>
  field: StateVector
  predictionErrorSummary?: PredictionErrorSummary
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const unique = <T>(values: T[]) => [...new Set(values)]
const getSensoryStrength = (sensoryMap: Map<string, ProtoMeaning>, glossJa: string) => {
  return [...sensoryMap.values()].find((meaning) => meaning.glossJa === glossJa)?.strength ?? 0
}
const getSensoryId = (sensoryMap: Map<string, ProtoMeaning>, glossJa: string) => {
  return [...sensoryMap.values()].find((meaning) => meaning.glossJa === glossJa)?.id
}
const getNodeValue = (nodeMap: Map<string, CoreNode>, id: string) => nodeMap.get(id)?.value ?? 0

const NARRATIVE_RULES: NarrativeRule[] = [
  {
    id: 'fraying',
    glossJa: '崩れかけている',
    toneTags: ['fragile', 'soft'],
    childGlosses: ['重い', '張っている', '閉じている'],
    score: ({ sensoryMap, nodeMap, field }) => clamp(
      getSensoryStrength(sensoryMap, '重い') * 0.24
      + getSensoryStrength(sensoryMap, '張っている') * 0.24
      + getSensoryStrength(sensoryMap, '閉じている') * 0.18
      + field.fragility * 0.22
      + getNodeValue(nodeMap, 'self_doubt') * 0.16,
    ),
    sourceNodeIds: ({ nodeMap }) => ['self_doubt', 'fatigue', 'anxiety'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'losing_meaning',
    glossJa: '意味を見失いかけている',
    toneTags: ['heavy', 'fragile'],
    childGlosses: ['重い', '揺れる'],
    score: ({ sensoryMap, nodeMap, field }) => clamp(
      getSensoryStrength(sensoryMap, '重い') * 0.28
      + getSensoryStrength(sensoryMap, '揺れる') * 0.28
      + getNodeValue(nodeMap, 'ambiguity') * 0.12
      + field.ambiguity * 0.12
      + (1 - field.agency) * 0.1
      + field.depth * 0.14,
    ),
    sourceNodeIds: ({ nodeMap }) => ['ambiguity', 'fatigue', 'vague_discomfort'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'searching_new_direction',
    glossJa: '新しい方向を探し始めている',
    toneTags: ['open', 'bright_hint'],
    childGlosses: ['鈍い', '開いている', 'かすかに明るい'],
    score: ({ sensoryMap, nodeMap, field, predictionErrorSummary }) => clamp(
      getSensoryStrength(sensoryMap, '鈍い') * 0.18
      + getSensoryStrength(sensoryMap, '開いている') * 0.26
      + getSensoryStrength(sensoryMap, 'かすかに明るい') * 0.18
      + getNodeValue(nodeMap, 'wanting_change') * 0.18
      + field.change * 0.16
      + (predictionErrorSummary?.overallSurprise ?? 0) * 0.14,
    ),
    sourceNodeIds: ({ nodeMap }) => ['wanting_change', 'faint_hope', 'leaving'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'rushing_answer',
    glossJa: '答えを急ぎすぎている',
    toneTags: ['tense', 'fragile'],
    childGlosses: ['押されている', '揺れる'],
    score: ({ sensoryMap, nodeMap, field }) => clamp(
      getSensoryStrength(sensoryMap, '押されている') * 0.32
      + getSensoryStrength(sensoryMap, '揺れる') * 0.16
      + getNodeValue(nodeMap, 'anxiety') * 0.14
      + getNodeValue(nodeMap, 'leaving') * 0.12
      + field.urgency * 0.26,
    ),
    sourceNodeIds: ({ nodeMap }) => ['anxiety', 'leaving', 'safety'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'do_not_push_yet',
    glossJa: 'まだ押さない方がよい',
    toneTags: ['soft', 'fragile'],
    childGlosses: ['閉じている', '押されている'],
    score: ({ sensoryMap, nodeMap, field }) => clamp(
      getSensoryStrength(sensoryMap, '閉じている') * 0.26
      + getSensoryStrength(sensoryMap, '押されている') * 0.18
      + getNodeValue(nodeMap, 'safety') * 0.14
      + getNodeValue(nodeMap, 'self_doubt') * 0.12
      + field.fragility * 0.22
      + (1 - field.agency) * 0.14,
    ),
    sourceNodeIds: ({ nodeMap }) => ['safety', 'self_doubt', 'anxiety'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'threshold_of_change',
    glossJa: '変化の入り口にいる',
    toneTags: ['open', 'bright_hint'],
    childGlosses: ['開いている', 'かすかに明るい'],
    score: ({ sensoryMap, nodeMap, field, predictionErrorSummary }) => clamp(
      getSensoryStrength(sensoryMap, '開いている') * 0.32
      + getSensoryStrength(sensoryMap, 'かすかに明るい') * 0.22
      + getNodeValue(nodeMap, 'wanting_change') * 0.14
      + field.change * 0.2
      + field.light * 0.12
      + (predictionErrorSummary?.overallSurprise ?? 0) * 0.12,
    ),
    sourceNodeIds: ({ nodeMap }) => ['wanting_change', 'faint_hope', 'seeking_understanding'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'needs_reorientation',
    glossJa: '休息より再定位が必要そう',
    toneTags: ['soft', 'searching'],
    childGlosses: ['鈍い', '揺れる'],
    score: ({ sensoryMap, nodeMap, field }) => clamp(
      getSensoryStrength(sensoryMap, '鈍い') * 0.22
      + getSensoryStrength(sensoryMap, '揺れる') * 0.22
      + getNodeValue(nodeMap, 'ambiguity') * 0.14
      + getNodeValue(nodeMap, 'wanting_change') * 0.12
      + field.depth * 0.16
      + field.change * 0.16,
    ),
    sourceNodeIds: ({ nodeMap }) => ['ambiguity', 'wanting_change', 'routine'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'purpose_core_thinning',
    glossJa: '目的の芯が薄れている',
    toneTags: ['heavy', 'dim'],
    childGlosses: ['重い', '鈍い', '滞っている'],
    score: ({ sensoryMap, nodeMap, field }) => clamp(
      getSensoryStrength(sensoryMap, '重い') * 0.22
      + getSensoryStrength(sensoryMap, '鈍い') * 0.18
      + getSensoryStrength(sensoryMap, '滞っている') * 0.18
      + getNodeValue(nodeMap, 'fatigue') * 0.12
      + getNodeValue(nodeMap, 'chronicity') * 0.12
      + field.depth * 0.1
      + (1 - field.agency) * 0.18,
    ),
    sourceNodeIds: ({ nodeMap }) => ['fatigue', 'chronicity', 'ambiguity'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
]

const MIN_STRENGTH = 0.4
const MAX_RESULTS = 5

export const deriveNarrativeProtoMeanings = (
  input: NarrativeProtoMeaningInput,
): ProtoMeaning[] => {
  const sensoryMap = new Map(input.sensoryProtoMeanings.map((meaning) => [meaning.id, meaning]))
  const nodeMap = new Map(input.nodes.map((node) => [node.id, node]))
  const context: RuleContext = {
    sensoryMap,
    nodeMap,
    field: input.field,
    predictionErrorSummary: input.predictionErrorSummary,
  }

  return NARRATIVE_RULES
    .map((rule) => {
      const childIds = unique(rule.childGlosses
        .map((glossJa) => getSensoryId(sensoryMap, glossJa))
        .filter((id): id is string => Boolean(id)))
      const childMeanings = childIds
        .map((id) => sensoryMap.get(id))
        .filter((meaning): meaning is ProtoMeaning => Boolean(meaning))

      return {
        id: `narrative:${rule.id}`,
        level: 'narrative' as const,
        glossJa: rule.glossJa,
        strength: rule.score(context),
        sourceFeatureIds: unique(childMeanings.flatMap((meaning) => meaning.sourceFeatureIds)),
        sourceNodeIds: unique([...rule.sourceNodeIds(context), ...childMeanings.flatMap((meaning) => meaning.sourceNodeIds)]),
        sourceBindingIds: unique(childMeanings.flatMap((meaning) => meaning.sourceBindingIds ?? [])),
        childIds,
        toneTags: rule.toneTags,
      }
    })
    .filter((meaning) => meaning.strength >= MIN_STRENGTH && (meaning.childIds?.length ?? 0) > 0)
    .sort((left, right) => right.strength - left.strength)
    .slice(0, MAX_RESULTS)
}
