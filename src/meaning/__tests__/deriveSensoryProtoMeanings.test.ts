import { describe, expect, it } from 'vitest'
import { deriveSensoryProtoMeanings } from '../deriveSensoryProtoMeanings'

describe('deriveSensoryProtoMeanings', () => {
  it('derives sensory proto meanings from feature, node, and field pressure', () => {
    const protoMeanings = deriveSensoryProtoMeanings({
      features: [
        { id: 'motivation_drop', rawStrength: 0.9, strength: 0.9, sourceChunkIndices: [0] },
        { id: 'distress_signal', rawStrength: 0.8, strength: 0.8, sourceChunkIndices: [0] },
        { id: 'purpose_confusion', rawStrength: 0.7, strength: 0.7, sourceChunkIndices: [0] },
        { id: 'uncertainty_expression', rawStrength: 0.65, strength: 0.65, sourceChunkIndices: [0] },
        { id: 'explicit_guidance_request', rawStrength: 0.72, strength: 0.72, sourceChunkIndices: [1] },
      ],
      nodes: [
        { id: 'fatigue', label: 'fatigue', category: 'state', value: 0.9, reasons: [] },
        { id: 'anxiety', label: 'anxiety', category: 'state', value: 0.72, reasons: [] },
        { id: 'ambiguity', label: 'ambiguity', category: 'state', value: 0.84, reasons: [] },
      ],
      field: {
        fragility: 0.66,
        urgency: 0.78,
        depth: 0.58,
        care: 0.42,
        agency: 0.3,
        ambiguity: 0.82,
        change: 0.34,
        stability: 0.5,
        self: 0.5,
        relation: 0.44,
        light: 0.22,
        heaviness: 0.88,
      },
      bindings: [
        { id: 'b_anxiety_safety', source: 'anxiety', target: 'safety', type: 'tension', weight: 0.7, reasons: [] },
      ],
    })

    expect(protoMeanings.some((meaning) => meaning.glossJa === '重い')).toBe(true)
    expect(protoMeanings.some((meaning) => meaning.glossJa === '揺れる')).toBe(true)
    expect(protoMeanings.some((meaning) => meaning.glossJa === '押されている')).toBe(true)

    const heavy = protoMeanings.find((meaning) => meaning.glossJa === '重い')
    expect(heavy?.sourceFeatureIds).toContain('motivation_drop')
    expect(heavy?.sourceNodeIds).toContain('fatigue')
  })
})
