import type { ChunkFeature } from '../signal/ingest/chunkTypes'
import type { MicroCue, MicroSignalState } from '../signal/packetTypes'
import type { Binding, CoreNode, StateVector } from '../types/nodeStudio'
import type { ProtoMeaning } from './types'

type SensoryProtoMeaningInput = {
  cues?: MicroCue[]
  features?: ChunkFeature[]
  nodes?: CoreNode[]
  field?: StateVector
  microState?: MicroSignalState
  bindings?: Binding[]
}

type SensoryRule = {
  id: string
  glossJa: string
  toneTags: string[]
  score: (ctx: RuleContext) => number
  sourceCueIds: (ctx: RuleContext) => string[]
  sourceNodeIds: (ctx: RuleContext) => string[]
}

type RuleContext = {
  cueStrength: (ids: string[]) => number
  nodeValue: (id: string) => number
  field: StateVector
  bindings: Binding[]
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const unique = <T>(values: T[]) => [...new Set(values)]

const toCueMap = (cues: MicroCue[] = [], features: ChunkFeature[] = []) => {
  const map = new Map<string, { strength: number }>()
  cues.forEach((cue) => map.set(cue.id, { strength: cue.strength }))
  features.forEach((feature) => map.set(feature.id, { strength: feature.strength }))
  return map
}

const blendFieldFromMicro = (field?: StateVector, microState?: MicroSignalState): StateVector => {
  if (!microState) return field ?? {
    fragility: 0, urgency: 0, depth: 0, care: 0, agency: 0, ambiguity: 0, change: 0, stability: 0, self: 0, relation: 0, light: 0, heaviness: 0,
  }

  const base: StateVector = field
    ? { ...field }
    : {
        fragility: 0,
        urgency: 0,
        depth: 0,
        care: 0,
        agency: 0,
        ambiguity: 0,
        change: 0,
        stability: 0,
        self: 0,
        relation: 0,
        light: 0,
        heaviness: 0,
      }

  const dims = microState.dimensions
  base.fragility = Math.max(base.fragility, dims.fragility)
  base.urgency = Math.max(base.urgency, dims.urgency)
  base.agency = Math.max(base.agency, dims.agency)
  base.ambiguity = Math.max(base.ambiguity, dims.uncertainty)
  base.change = Math.max(base.change, dims.drift)
  base.stability = Math.max(base.stability, 1 - dims.drift)
  base.relation = Math.max(base.relation, dims.resonance)
  base.light = Math.max(base.light, dims.clarity)
  base.heaviness = Math.max(base.heaviness, dims.heaviness)
  base.self = Math.max(base.self, dims.purposeCoherence)
  base.depth = Math.max(base.depth, dims.tension)
  base.care = Math.max(base.care, dims.answerPressure)

  return base
}

const buildCueStrengthFn = (cueMap: Map<string, { strength: number }>) => (ids: string[]) => {
  if (ids.length === 0) return 0
  return Math.max(...ids.map((id) => cueMap.get(id)?.strength ?? 0))
}

const buildNodeValueFn = (nodes: CoreNode[] = []) => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node.value]))
  return (id: string) => nodeMap.get(id) ?? 0
}

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
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['motivation_drop', 'distress_cue', 'distress_signal']) * 0.36
      + nodeValue('fatigue') * 0.24
      + nodeValue('anxiety') * 0.1
      + field.heaviness * 0.26
      + (1 - field.light) * 0.08,
    ),
    sourceCueIds: ({ cueStrength }) => ['motivation_drop', 'distress_cue', 'distress_signal'].filter((id) => cueStrength([id]) > 0.18),
    sourceNodeIds: ({ nodeValue }) => ['fatigue', 'anxiety', 'chronicity'].filter((id) => nodeValue(id) > 0.18),
  },
  {
    id: 'swaying',
    glossJa: '揺れる',
    toneTags: ['fragile', 'soft'],
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['uncertainty_cue', 'purpose_confusion_cue', 'purpose_confusion', 'uncertainty_expression']) * 0.38
      + nodeValue('ambiguity') * 0.2
      + field.ambiguity * 0.22,
    ),
    sourceCueIds: ({ cueStrength }) => ['uncertainty_cue', 'purpose_confusion_cue', 'purpose_confusion', 'uncertainty_expression'].filter((id) => cueStrength([id]) > 0.16),
    sourceNodeIds: ({ nodeValue }) => ['ambiguity', 'vague_discomfort', 'anxiety'].filter((id) => nodeValue(id) > 0.16),
  },
  {
    id: 'closed',
    glossJa: '閉じている',
    toneTags: ['fragile', 'soft'],
    score: ({ nodeValue, field }) => clamp(
      nodeValue('self_doubt') * 0.24
      + nodeValue('safety') * 0.18
      + field.fragility * 0.28
      + field.stability * 0.12
      + (1 - field.agency) * 0.2,
    ),
    sourceCueIds: () => [],
    sourceNodeIds: ({ nodeValue }) => ['self_doubt', 'safety', 'loneliness'].filter((id) => nodeValue(id) > 0.16),
  },
  {
    id: 'open',
    glossJa: '開いている',
    toneTags: ['open', 'bright_hint'],
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['guidance_request_cue', 'explicit_guidance_request']) * 0.18
      + cueStrength(['hope_signal', 'faint_possibility_cue']) * 0.26
      + nodeValue('wanting_change') * 0.22
      + nodeValue('faint_hope') * 0.18
      + field.change * 0.18
      + field.light * 0.1,
    ),
    sourceCueIds: ({ cueStrength }) => ['guidance_request_cue', 'explicit_guidance_request', 'hope_signal', 'faint_possibility_cue'].filter((id) => cueStrength([id]) > 0.12),
    sourceNodeIds: ({ nodeValue }) => ['wanting_change', 'faint_hope', 'seeking_understanding'].filter((id) => nodeValue(id) > 0.12),
  },
  {
    id: 'pressed',
    glossJa: '押されている',
    toneTags: ['tense', 'fragile'],
    score: ({ cueStrength, nodeValue, field, bindings }) => clamp(
      cueStrength(['pressure_cue', 'guidance_request_cue', 'explicit_guidance_request']) * 0.32
      + nodeValue('anxiety') * 0.2
      + nodeValue('leaving') * 0.14
      + field.urgency * 0.26
      + (bindings.some((binding) => binding.type === 'tension') ? 0.08 : 0),
    ),
    sourceCueIds: ({ cueStrength }) => ['pressure_cue', 'guidance_request_cue', 'explicit_guidance_request'].filter((id) => cueStrength([id]) > 0.14),
    sourceNodeIds: ({ nodeValue }) => ['anxiety', 'leaving', 'safety'].filter((id) => nodeValue(id) > 0.14),
  },
  {
    id: 'dull',
    glossJa: '鈍い',
    toneTags: ['dim', 'heavy'],
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['monotony_cue', 'monotony']) * 0.34
      + nodeValue('routine') * 0.24
      + nodeValue('fatigue') * 0.12
      + field.heaviness * 0.16
      + (1 - field.light) * 0.22,
    ),
    sourceCueIds: ({ cueStrength }) => ['monotony_cue', 'monotony', 'motivation_drop'].filter((id) => cueStrength([id]) > 0.12),
    sourceNodeIds: ({ nodeValue }) => ['routine', 'fatigue', 'chronicity'].filter((id) => nodeValue(id) > 0.12),
  },
  {
    id: 'taut',
    glossJa: '張っている',
    toneTags: ['tense'],
    score: ({ cueStrength, nodeValue, field, bindings }) => clamp(
      cueStrength(['distress_cue', 'distress_signal']) * 0.14
      + cueStrength(['contrast_cue']) * 0.12
      + cueStrength(['pressure_cue']) * 0.12
      + nodeValue('anxiety') * 0.22
      + field.fragility * 0.16
      + field.urgency * 0.22
      + (bindings.some((binding) => ['tension', 'conflicts_with'].includes(binding.type)) ? 0.18 : 0),
    ),
    sourceCueIds: ({ cueStrength }) => ['distress_cue', 'distress_signal', 'contrast_cue', 'pressure_cue'].filter((id) => cueStrength([id]) > 0.1),
    sourceNodeIds: ({ nodeValue }) => ['anxiety', 'self_doubt', 'safety'].filter((id) => nodeValue(id) > 0.1),
  },
  {
    id: 'bright_hint',
    glossJa: 'かすかに明るい',
    toneTags: ['bright_hint', 'soft'],
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['faint_possibility_cue', 'hope_signal']) * 0.42
      + nodeValue('faint_hope') * 0.3
      + field.light * 0.2
      + Math.max(0, 0.14 - field.heaviness * 0.08),
    ),
    sourceCueIds: ({ cueStrength }) => ['faint_possibility_cue', 'hope_signal'].filter((id) => cueStrength([id]) > 0.12),
    sourceNodeIds: ({ nodeValue }) => ['faint_hope', 'wanting_change'].filter((id) => nodeValue(id) > 0.12),
  },
  {
    id: 'dry',
    glossJa: '乾いている',
    toneTags: ['dim'],
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['monotony_cue', 'monotony']) * 0.18
      + nodeValue('routine') * 0.18
      + field.stability * 0.16
      + (1 - field.care) * 0.24
      + (1 - field.relation) * 0.24,
    ),
    sourceCueIds: ({ cueStrength }) => ['monotony_cue', 'monotony'].filter((id) => cueStrength([id]) > 0.12),
    sourceNodeIds: ({ nodeValue }) => ['routine', 'loneliness'].filter((id) => nodeValue(id) > 0.12),
  },
  {
    id: 'stagnant',
    glossJa: '滞っている',
    toneTags: ['heavy', 'dim'],
    score: ({ cueStrength, nodeValue, field }) => clamp(
      cueStrength(['monotony_cue', 'monotony']) * 0.22
      + cueStrength(['contrast_cue', 'temporal_contrast']) * 0.18
      + nodeValue('routine') * 0.18
      + nodeValue('chronicity') * 0.18
      + field.stability * 0.12
      + field.change * 0.08,
    ),
    sourceCueIds: ({ cueStrength }) => ['monotony_cue', 'monotony', 'contrast_cue', 'temporal_contrast'].filter((id) => cueStrength([id]) > 0.1),
    sourceNodeIds: ({ nodeValue }) => ['routine', 'chronicity', 'fatigue'].filter((id) => nodeValue(id) > 0.1),
  },
]

// Sensory should stay broad enough to seed the next layer, so it keeps a slightly
// lower threshold and allows up to ~3–7 concurrent bodily-feel candidates.
const MIN_STRENGTH = 0.3
const MAX_RESULTS = 7

export const deriveSensoryProtoMeanings = (
  input: SensoryProtoMeaningInput,
): ProtoMeaning[] => {
  const cueMap = toCueMap(input.cues, input.features)
  const field = blendFieldFromMicro(input.field, input.microState)
  const cueStrength = buildCueStrengthFn(cueMap)
  const nodeValue = buildNodeValueFn(input.nodes)
  const bindings = input.bindings ?? []

  const context: RuleContext = {
    cueStrength,
    nodeValue,
    field,
    bindings,
  }

  return SENSORY_RULES
    .map((rule) => {
      const strength = rule.score(context)
      const sourceCueIds = unique(rule.sourceCueIds(context))
      const sourceNodeIds = unique(rule.sourceNodeIds(context))

      return {
        id: `sensory:${rule.id}`,
        level: 'sensory' as const,
        glossJa: rule.glossJa,
        strength,
        sourceCueIds,
        sourceNodeIds: sourceNodeIds.length > 0 ? sourceNodeIds : undefined,
        sourceBindingIds: collectBindingIds(bindings, sourceNodeIds),
        toneTags: rule.toneTags,
      }
    })
    .filter((meaning) => meaning.strength >= MIN_STRENGTH)
    .sort((left, right) => right.strength - left.strength)
    .slice(0, MAX_RESULTS)
}
