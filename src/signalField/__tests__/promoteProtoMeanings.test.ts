import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { promoteProtoMeanings } from '../promoteProtoMeanings'
import type { Assembly } from '../signalFieldTypes'

describe('promoteProtoMeanings', () => {
  it('promotes assemblies with sufficient recurrence and coactivation', () => {
    const state = createStableParticleField()
    const assembly: Assembly = {
      id: 'assembly_test',
      particleIds: ['p0', 'p1', 'p2'],
      recurrenceCount: 5,
      averageCoactivation: 0.8,
      lastActivatedAt: 1000,
    }
    const stateWithAssembly = { ...state, assemblies: [assembly] }
    const promoted = promoteProtoMeanings(stateWithAssembly, 2000)
    expect(promoted.protoMeanings.length).toBe(1)
    expect(promoted.protoMeanings[0]?.assemblyIds).toContain('assembly_test')
  })

  it('does not promote assemblies with low recurrence', () => {
    const state = createStableParticleField()
    const assembly: Assembly = {
      id: 'assembly_test2',
      particleIds: ['p0', 'p1', 'p2'],
      recurrenceCount: 1,
      averageCoactivation: 0.8,
      lastActivatedAt: 1000,
    }
    const stateWithAssembly = { ...state, assemblies: [assembly] }
    const result = promoteProtoMeanings(stateWithAssembly, 2000)
    expect(result.protoMeanings.length).toBe(0)
  })
})
