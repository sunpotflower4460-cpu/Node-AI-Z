import { describe, expect, it } from 'vitest'
import { chunkText } from '../../signal/ingest/chunkText'
import { detectOptions } from '../detectOptions'
import { buildOptionFields } from '../buildOptionFields'
import { applyOptionCompetition } from '../applyOptionCompetition'
import { summarizeOptionAwareness } from '../summarizeOptionAwareness'
import { mapOptionAwarenessToDecision } from '../mapOptionAwarenessToDecision'
import { mapOptionAwarenessToUtteranceHints } from '../mapOptionAwarenessToUtteranceHints'
import type { ProtoMeaning } from '../../meaning/types'
import type { CoreNode, StateVector } from '../../types/nodeStudio'

const baseField: StateVector = {
  fragility: 0.48,
  urgency: 0.44,
  depth: 0.58,
  care: 0.52,
  agency: 0.42,
  ambiguity: 0.55,
  change: 0.76,
  stability: 0.34,
  self: 0.52,
  relation: 0.4,
  light: 0.46,
  heaviness: 0.62,
}

const nodes: CoreNode[] = [
  { id: 'wanting_change', label: 'wanting_change', category: 'self', value: 0.78, reasons: [] },
  { id: 'safety', label: 'safety', category: 'belief', value: 0.58, reasons: [] },
  { id: 'fatigue', label: 'fatigue', category: 'self', value: 0.54, reasons: [] },
]

const sensoryProtoMeanings: ProtoMeaning[] = [
  { id: 'sensory:open', level: 'sensory', glossJa: '開いている', strength: 0.76, sourceCueIds: [], sourceNodeIds: [] },
  { id: 'sensory:bright_hint', level: 'sensory', glossJa: 'かすかに明るい', strength: 0.63, sourceCueIds: [], sourceNodeIds: [] },
  { id: 'sensory:heavy', level: 'sensory', glossJa: '重い', strength: 0.59, sourceCueIds: [], sourceNodeIds: [] },
  { id: 'sensory:closed', level: 'sensory', glossJa: '閉じている', strength: 0.52, sourceCueIds: [], sourceNodeIds: [] },
]

const narrativeProtoMeanings: ProtoMeaning[] = [
  {
    id: 'narrative:searching_new_direction',
    level: 'narrative',
    glossJa: '新しい方向を探し始めている',
    strength: 0.81,
    sourceCueIds: [],
    sourceNodeIds: ['wanting_change'],
    childIds: ['sensory:open', 'sensory:bright_hint'],
  },
  {
    id: 'narrative:do_not_push_yet',
    level: 'narrative',
    glossJa: 'まだ押さない方がよい',
    strength: 0.62,
    sourceCueIds: [],
    sourceNodeIds: ['safety'],
    childIds: ['sensory:closed'],
  },
]

describe('Option Field Network v1', () => {
  it('detects competing options from choice-like input', () => {
    const options = detectOptions({
      chunks: chunkText('転職するか、このまま続けるかで迷っている'),
      narrativeProtoMeanings,
      nodes,
      field: baseField,
    })

    expect(options.map((option) => option.id)).toContain('option:change')
    expect(options.map((option) => option.id)).toContain('option:stay')
  })

  it('builds multilayer local fields and explicit awareness', () => {
    const chunks = chunkText('転職するか、このまま続けるかで迷っている')
    const options = detectOptions({
      chunks,
      narrativeProtoMeanings,
      nodes,
      field: baseField,
    })

    const fields = buildOptionFields({
      options,
      chunks,
      sensoryProtoMeanings,
      narrativeProtoMeanings,
      nodes,
      field: baseField,
    })
    const competition = applyOptionCompetition({ optionFields: fields })
    const awareness = summarizeOptionAwareness({ options, competition })
    const decision = mapOptionAwarenessToDecision({ awareness })
    const hints = mapOptionAwarenessToUtteranceHints({ options, awareness, decision })

    expect(fields.every((field) => typeof field.netPull === 'number')).toBe(true)
    expect(Object.values(awareness.optionRatios).reduce((sum, ratio) => sum + ratio, 0)).toBe(100)
    expect(awareness.summaryLabel.length).toBeGreaterThan(0)
    expect(decision.notes.length).toBeGreaterThan(0)
    expect(hints.suggestedClose.length).toBeGreaterThan(0)
  })
})
