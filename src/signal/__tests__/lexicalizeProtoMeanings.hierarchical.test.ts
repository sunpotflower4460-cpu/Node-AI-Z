import { describe, expect, it } from 'vitest'
import { lexicalizeProtoMeanings } from '../lexicalizeProtoMeanings'

describe('lexicalizeProtoMeanings — hierarchical proto meanings', () => {
  it('splits narrative core and sensory tone candidates', () => {
    const candidates = lexicalizeProtoMeanings({
      sensory: [
        { id: 'sensory:heavy', level: 'sensory', glossJa: '重い', strength: 0.72, sourceFeatureIds: [], sourceNodeIds: [] },
        { id: 'sensory:swaying', level: 'sensory', glossJa: '揺れる', strength: 0.68, sourceFeatureIds: [], sourceNodeIds: [] },
      ],
      narrative: [
        {
          id: 'narrative:meaning_loss',
          level: 'narrative',
          glossJa: '意味を見失いかけている',
          strength: 0.84,
          sourceFeatureIds: [],
          sourceNodeIds: [],
          childIds: ['sensory:heavy', 'sensory:swaying'],
        },
      ],
      all: [],
    })

    expect(candidates[0].role).toBe('core')
    expect(candidates[0].glossJa).toBe('意味を見失いかけている')
    expect(candidates.some((candidate) => candidate.role === 'tone' && candidate.glossJa === '重い')).toBe(true)
    expect(candidates.some((candidate) => candidate.words.includes('揺らいでる'))).toBe(true)
  })
})
