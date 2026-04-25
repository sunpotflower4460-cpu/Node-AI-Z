import { describe, it, expect } from 'vitest'
import { buildSignalVsLexicalComparison } from '../buildSignalVsLexicalComparison'
import type { ProtoMeaningSeed, MixedLatentSeed } from '../../signalField/signalFieldTypes'
import type { ProtoMeaning } from '../../meaning/types'

describe('buildSignalVsLexicalComparison', () => {
  it('returns valid structure for empty inputs', () => {
    const result = buildSignalVsLexicalComparison({})
    expect(result.lexicalChunks).toEqual([])
    expect(result.signalAssemblies).toEqual([])
    expect(result.lexicalProtoCandidates).toEqual([])
    expect(result.signalProtoSeeds).toEqual([])
    expect(result.rows.length).toBeGreaterThan(0)
  })

  it('includes lexical chunks in the comparison', () => {
    const result = buildSignalVsLexicalComparison({
      lexicalChunks: ['hello', 'world'],
    })
    expect(result.lexicalChunks).toContain('hello')
    expect(result.rows[0]?.lexicalValue).toContain('hello')
  })

  it('includes signal assembly ids', () => {
    const result = buildSignalVsLexicalComparison({
      signalAssemblyIds: ['asm1', 'asm2'],
    })
    expect(result.signalAssemblies).toContain('asm1')
    expect(result.rows[0]?.signalValue).toContain('2 assemblies')
  })

  it('shows lexical proto candidates from meanings', () => {
    const meanings: ProtoMeaning[] = [
      { id: 'm1', level: 'sensory', glossJa: '痛み', strength: 0.8, sourceCueIds: [] },
    ]
    const result = buildSignalVsLexicalComparison({ lexicalSensoryMeanings: meanings })
    expect(result.lexicalProtoCandidates.some(c => c.includes('痛み'))).toBe(true)
    expect(result.lexicalMeaningBias).toContain('痛み')
  })

  it('shows signal proto seeds with seedType and features', () => {
    const seeds: ProtoMeaningSeed[] = [
      {
        id: 's1',
        sourceAssemblyIds: ['a1'],
        strength: 0.7,
        seedType: 'assembly_cluster',
        features: ['repeated_cluster'],
      },
    ]
    const result = buildSignalVsLexicalComparison({ signalProtoSeeds: seeds })
    expect(result.signalProtoSeeds.some(s => s.includes('assembly_cluster'))).toBe(true)
    expect(result.signalProtoSeeds.some(s => s.includes('repeated_cluster'))).toBe(true)
  })

  it('shows signal latent bias from mixed seeds', () => {
    const mixedSeeds: MixedLatentSeed[] = [
      {
        id: 'm1',
        sourceSeedIds: ['s1'],
        weight: 0.8,
        axes: { repetition: 0.7, instability: 0.1 },
      },
    ]
    const result = buildSignalVsLexicalComparison({ signalMixedSeeds: mixedSeeds })
    expect(result.signalLatentBias.some(b => b.includes('repetition'))).toBe(true)
  })

  it('rows dimension covers input_chunks, proto_candidates, meaning_bias', () => {
    const result = buildSignalVsLexicalComparison({})
    const dims = result.rows.map(r => r.dimension)
    expect(dims).toContain('input chunks')
    expect(dims).toContain('proto candidates')
    expect(dims).toContain('meaning bias')
  })
})
