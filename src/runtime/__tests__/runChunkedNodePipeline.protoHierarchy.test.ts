import { describe, expect, it } from 'vitest'
import { runChunkedNodePipeline } from '../runChunkedNodePipeline'

describe('runChunkedNodePipeline — proto hierarchy integration', () => {
  it('derives sensory and narrative proto meanings and exposes hierarchy data', () => {
    const result = runChunkedNodePipeline('意欲が湧かなくて、何のために働いているのか分からないし、どうすべきか悩んでいる')

    expect(result.sensoryProtoMeanings.length).toBeGreaterThan(0)
    expect(result.narrativeProtoMeanings.length).toBeGreaterThan(0)
    expect(result.protoMeaningHierarchy.all.length).toBe(
      result.sensoryProtoMeanings.length + result.narrativeProtoMeanings.length,
    )
    expect(result.narrativeProtoMeanings.some((meaning) => (meaning.childIds ?? []).length > 0)).toBe(true)
    expect(result.pathwayKeys?.some((key) => key.includes('->sensory:'))).toBe(true)
    expect(result.pathwayKeys?.some((key) => key.includes('->narrative:'))).toBe(true)
  })
})
