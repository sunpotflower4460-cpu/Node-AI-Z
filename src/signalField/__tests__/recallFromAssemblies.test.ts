import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../createStableParticleField'
import { recallFromAssemblies } from '../recallFromAssemblies'
import type { Assembly, CrossModalBridge } from '../signalFieldTypes'

describe('recallFromAssemblies', () => {
  it('recalls particles from bridged assemblies', () => {
    const state = createStableParticleField()
    const asmA: Assembly = { id: 'asm_a', particleIds: ['p0', 'p1'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 }
    const asmB: Assembly = { id: 'asm_b', particleIds: ['p2', 'p3'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 }
    const bridge: CrossModalBridge = {
      id: 'bridge_ab',
      sourceAssemblyId: 'asm_a',
      targetAssemblyId: 'asm_b',
      confidence: 0.8,
      stage: 'reinforced',
      createdAt: 50,
    }
    const stateWithBridge = { ...state, assemblies: [asmA, asmB], crossModalBridges: [bridge] }
    const { recalledAssemblyIds, recallEvents } = recallFromAssemblies(stateWithBridge, 'asm_a', 200)
    expect(recalledAssemblyIds).toContain('asm_b')
    expect(recallEvents.length).toBeGreaterThan(0)
  })

  it('returns empty result for unknown assembly', () => {
    const state = createStableParticleField()
    const { recalledAssemblyIds, recallEvents } = recallFromAssemblies(state, 'nonexistent', 100)
    expect(recalledAssemblyIds).toHaveLength(0)
    expect(recallEvents).toHaveLength(0)
  })
})
