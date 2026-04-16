import type { ChunkFeature } from '../signal/chunkTypes'
import type { Binding, CoreNode, StateVector } from '../../types/nodeStudio'
import type { ProtoMeaning } from './types'

type SensoryProtoMeaningInput = {
  features: ChunkFeature[]
  nodes: CoreNode[]
  field: StateVector
  bindings?: Binding[]
}

type SensoryRule = {
  id: string
  glossJa: string
  toneTags: string[]
  score: (ctx: RuleContext) => number
  sourceFeatureIds: (ctx: RuleContext) => string[]
  sourceNodeIds: (ctx: RuleContext) => string[]
}

type RuleContext = {
  featureMap: Map<string, ChunkFeature>
  nodeMap: Map<string, CoreNode>
  field: StateVector
  bindings: Binding[]
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const unique = <T>(values: T[]) => [...new Set(values)]

const getStrength = (featureMap: Map<string, ChunkFeature>, id: string) => featureMap.get(id)?.strength ?? 0
const getNodeValue = (nodeMap: Map<string, CoreNode>, id: string) => nodeMap.get(id)?.value ?? 0

const collectBindingIds = (bindings: Binding[], nodeIds: string[]) => {
  if (nodeIds.length === 0) return undefined
  const bindingIds = bindings
    .filter((binding) => nodeIds.includes(binding.source) || nodeIds.includes(binding.target))
    .map((binding) => binding.id)

  return bindingIds.length > 0 ? unique(bindingIds) : undefined
}

const SENSORY_RULES: SensoryRule[] = [
  {
    id: 'heavy',
    glossJa: '重い',
    toneTags: ['heavy', 'soft'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'motivation_drop') * 0.34
      + getStrength(featureMap, 'distress_signal') * 0.24
      + getNodeValue(nodeMap, 'fatigue') * 0.24
      + field.heaviness * 0.26
      + (1 - field.light) * 0.1,
    ),
    sourceFeatureIds: ({ featureMap }) => ['motivation_drop', 'distress_signal'].filter((id) => getStrength(featureMap, id) > 0.18),
    sourceNodeIds: ({ nodeMap }) => ['fatigue', 'anxiety', 'chronicity'].filter((id) => getNodeValue(nodeMap, id) > 0.18),
  },
  {
    id: 'swaying',
    glossJa: '揺れる',
    toneTags: ['fragile', 'soft'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'uncertainty_expression') * 0.34
      + getStrength(featureMap, 'purpose_confusion') * 0.34
      + getNodeValue(nodeMap, 'ambiguity') * 0.2
      + field.ambiguity * 0.22,
    ),
    sourceFeatureIds: ({ featureMap }) => ['uncertainty_expression', 'purpose_confusion'].filter((id) => getStrength(featureMap, id) > 0.16),
    sourceNodeIds: ({ nodeMap }) => ['ambiguity', 'vague_discomfort', 'anxiety'].filter((id) => getNodeValue(nodeMap, id) > 0.16),
  },
  {
    id: 'closed',
    glossJa: '閉じている',
    toneTags: ['fragile', 'soft'],
    score: ({ nodeMap, field }) => clamp(
      getNodeValue(nodeMap, 'self_doubt') * 0.24
      + getNodeValue(nodeMap, 'safety') * 0.18
      + field.fragility * 0.28
      + field.stability * 0.12
      + (1 - field.agency) * 0.2,
    ),
    sourceFeatureIds: () => [],
    sourceNodeIds: ({ nodeMap }) => ['self_doubt', 'safety', 'loneliness'].filter((id) => getNodeValue(nodeMap, id) > 0.16),
  },
  {
    id: 'open',
    glossJa: '開いている',
    toneTags: ['open', 'bright_hint'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'explicit_guidance_request') * 0.16
      + getStrength(featureMap, 'hope_signal') * 0.22
      + getNodeValue(nodeMap, 'wanting_change') * 0.22
      + getNodeValue(nodeMap, 'faint_hope') * 0.18
      + field.change * 0.22
      + field.light * 0.1,
    ),
    sourceFeatureIds: ({ featureMap }) => ['explicit_guidance_request', 'hope_signal'].filter((id) => getStrength(featureMap, id) > 0.12),
    sourceNodeIds: ({ nodeMap }) => ['wanting_change', 'faint_hope', 'seeking_understanding'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'pressed',
    glossJa: '押されている',
    toneTags: ['tense', 'fragile'],
    score: ({ featureMap, nodeMap, field, bindings }) => clamp(
      getStrength(featureMap, 'explicit_guidance_request') * 0.28
      + getStrength(featureMap, 'distress_signal') * 0.18
      + getNodeValue(nodeMap, 'anxiety') * 0.22
      + getNodeValue(nodeMap, 'leaving') * 0.14
      + field.urgency * 0.26
      + (bindings.some((binding) => binding.type === 'tension') ? 0.08 : 0),
    ),
    sourceFeatureIds: ({ featureMap }) => ['explicit_guidance_request', 'distress_signal'].filter((id) => getStrength(featureMap, id) > 0.14),
    sourceNodeIds: ({ nodeMap }) => ['anxiety', 'leaving', 'safety'].filter((id) => getNodeValue(nodeMap, id) > 0.14),
  },
  {
    id: 'dull',
    glossJa: '鈍い',
    toneTags: ['dim', 'heavy'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'monotony') * 0.34
      + getNodeValue(nodeMap, 'routine') * 0.24
      + getNodeValue(nodeMap, 'fatigue') * 0.12
      + field.heaviness * 0.16
      + (1 - field.light) * 0.22,
    ),
    sourceFeatureIds: ({ featureMap }) => ['monotony', 'motivation_drop'].filter((id) => getStrength(featureMap, id) > 0.12),
    sourceNodeIds: ({ nodeMap }) => ['routine', 'fatigue', 'chronicity'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'taut',
    glossJa: '張っている',
    toneTags: ['tense'],
    score: ({ featureMap, nodeMap, field, bindings }) => clamp(
      getStrength(featureMap, 'distress_signal') * 0.14
      + getStrength(featureMap, 'self_critique') * 0.14
      + getNodeValue(nodeMap, 'anxiety') * 0.24
      + field.fragility * 0.16
      + field.urgency * 0.22
      + (bindings.some((binding) => ['tension', 'conflicts_with'].includes(binding.type)) ? 0.2 : 0),
    ),
    sourceFeatureIds: ({ featureMap }) => ['distress_signal', 'self_critique'].filter((id) => getStrength(featureMap, id) > 0.1),
    sourceNodeIds: ({ nodeMap }) => ['anxiety', 'self_doubt', 'safety'].filter((id) => getNodeValue(nodeMap, id) > 0.1),
  },
  {
    id: 'bright_hint',
    glossJa: 'かすかに明るい',
    toneTags: ['bright_hint', 'soft'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'hope_signal') * 0.38
      + getNodeValue(nodeMap, 'faint_hope') * 0.34
      + field.light * 0.22
      + Math.max(0, 0.14 - field.heaviness * 0.08),
    ),
    sourceFeatureIds: ({ featureMap }) => ['hope_signal'].filter((id) => getStrength(featureMap, id) > 0.12),
    sourceNodeIds: ({ nodeMap }) => ['faint_hope', 'wanting_change'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'dry',
    glossJa: '乾いている',
    toneTags: ['dim'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'monotony') * 0.18
      + getNodeValue(nodeMap, 'routine') * 0.18
      + field.stability * 0.16
      + (1 - field.care) * 0.24
      + (1 - field.relation) * 0.24,
    ),
    sourceFeatureIds: ({ featureMap }) => ['monotony'].filter((id) => getStrength(featureMap, id) > 0.12),
    sourceNodeIds: ({ nodeMap }) => ['routine', 'loneliness'].filter((id) => getNodeValue(nodeMap, id) > 0.12),
  },
  {
    id: 'stagnant',
    glossJa: '滞っている',
    toneTags: ['heavy', 'dim'],
    score: ({ featureMap, nodeMap, field }) => clamp(
      getStrength(featureMap, 'monotony') * 0.22
      + getStrength(featureMap, 'temporal_contrast') * 0.22
      + getNodeValue(nodeMap, 'routine') * 0.18
      + getNodeValue(nodeMap, 'chronicity') * 0.18
      + field.stability * 0.12
      + field.change * 0.08,
    ),
    sourceFeatureIds: ({ featureMap }) => ['monotony', 'temporal_contrast'].filter((id) => getStrength(featureMap, id) > 0.1),
    sourceNodeIds: ({ nodeMap }) => ['routine', 'chronicity', 'fatigue'].filter((id) => getNodeValue(nodeMap, id) > 0.1),
  },
]

// Sensory should stay broad enough to seed the next layer, so it keeps a slightly
// lower threshold and allows up to ~3–7 concurrent bodily-feel candidates.
const MIN_STRENGTH = 0.3
const MAX_RESULTS = 7

export const deriveSensoryProtoMeanings = (
  input: SensoryProtoMeaningInput,
): ProtoMeaning[] => {
  const context: RuleContext = {
    featureMap: new Map(input.features.map((feature) => [feature.id, feature])),
    nodeMap: new Map(input.nodes.map((node) => [node.id, node])),
    field: input.field,
    bindings: input.bindings ?? [],
  }

  return SENSORY_RULES
    .map((rule) => {
      const strength = rule.score(context)
      const sourceFeatureIds = unique(rule.sourceFeatureIds(context))
      const sourceNodeIds = unique(rule.sourceNodeIds(context))

      return {
        id: `sensory:${rule.id}`,
        level: 'sensory' as const,
        glossJa: rule.glossJa,
        strength,
        sourceFeatureIds,
        sourceNodeIds,
        sourceBindingIds: collectBindingIds(context.bindings, sourceNodeIds),
        toneTags: rule.toneTags,
      }
    })
    .filter((meaning) => meaning.strength >= MIN_STRENGTH)
    .sort((left, right) => right.strength - left.strength)
    .slice(0, MAX_RESULTS)
}
