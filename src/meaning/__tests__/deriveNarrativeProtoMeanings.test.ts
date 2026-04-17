import { describe, expect, it } from 'vitest'
import { deriveNarrativeProtoMeanings } from '../deriveNarrativeProtoMeanings'

describe('deriveNarrativeProtoMeanings', () => {
  it('derives narrative meanings from sensory combinations and keeps childIds', () => {
    const protoMeanings = deriveNarrativeProtoMeanings({
      sensoryProtoMeanings: [
        {
          id: 'sensory:heavy',
          level: 'sensory',
          glossJa: '重い',
          strength: 0.84,
          sourceFeatureIds: ['motivation_drop'],
          sourceNodeIds: ['fatigue'],
        },
        {
          id: 'sensory:swaying',
          level: 'sensory',
          glossJa: '揺れる',
          strength: 0.78,
          sourceFeatureIds: ['purpose_confusion'],
          sourceNodeIds: ['ambiguity'],
        },
        {
          id: 'sensory:pressed',
          level: 'sensory',
          glossJa: '押されている',
          strength: 0.74,
          sourceFeatureIds: ['explicit_guidance_request'],
          sourceNodeIds: ['anxiety'],
        },
      ],
      nodes: [
        { id: 'fatigue', label: 'fatigue', category: 'state', value: 0.88, reasons: [] },
        { id: 'ambiguity', label: 'ambiguity', category: 'state', value: 0.8, reasons: [] },
        { id: 'anxiety', label: 'anxiety', category: 'state', value: 0.76, reasons: [] },
      ],
      field: {
        fragility: 0.58,
        urgency: 0.82,
        depth: 0.7,
        care: 0.4,
        agency: 0.28,
        ambiguity: 0.8,
        change: 0.24,
        stability: 0.46,
        self: 0.5,
        relation: 0.44,
        light: 0.26,
        heaviness: 0.82,
      },
    })

    const losingMeaning = protoMeanings.find((meaning) => meaning.glossJa === '意味を見失いかけている')
    const rushingAnswer = protoMeanings.find((meaning) => meaning.glossJa === '答えを急ぎすぎている')

    expect(losingMeaning).toBeDefined()
    expect(losingMeaning?.childIds).toEqual(expect.arrayContaining(['sensory:heavy', 'sensory:swaying']))
    expect(rushingAnswer?.childIds).toContain('sensory:pressed')
  })
})
