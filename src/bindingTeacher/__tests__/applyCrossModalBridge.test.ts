import { describe, it, expect } from 'vitest'
import { createStableParticleField } from '../../signalField/createStableParticleField'
import { applyCrossModalBridge } from '../applyCrossModalBridge'
import type { Assembly } from '../../signalField/signalFieldTypes'

describe('applyCrossModalBridge', () => {
  it('creates a tentative bridge for closely_related result', () => {
    const base = createStableParticleField()
    const asmA: Assembly = { id: 'asm_a', particleIds: ['p0'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 }
    const asmB: Assembly = { id: 'asm_b', particleIds: ['p1'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 }
    const state = { ...base, assemblies: [asmA, asmB] }
    const result = applyCrossModalBridge(state, 'asm_a', 'asm_b', {
      relation: 'closely_related',
      confidence: 0.7,
      reasons: ['test'],
    }, 200)
    expect(result.crossModalBridges).toHaveLength(1)
    expect(result.crossModalBridges[0]?.stage).toBe('tentative')
  })

  it('advances bridge stage on repeated binding', () => {
    const base = createStableParticleField()
    const asmA: Assembly = { id: 'asm_a', particleIds: ['p0'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 }
    const asmB: Assembly = { id: 'asm_b', particleIds: ['p1'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 }
    let state = { ...base, assemblies: [asmA, asmB] }
    const teacherResult = { relation: 'closely_related' as const, confidence: 0.7, reasons: ['test'] }
    state = applyCrossModalBridge(state, 'asm_a', 'asm_b', teacherResult, 200)
    state = applyCrossModalBridge(state, 'asm_a', 'asm_b', teacherResult, 300)
    expect(state.crossModalBridges[0]?.stage).toBe('reinforced')
  })

  it('does not create bridge for unrelated result', () => {
    const base = createStableParticleField()
    const result = applyCrossModalBridge(base, 'asm_a', 'asm_b', {
      relation: 'unrelated',
      confidence: 0.9,
      reasons: ['test'],
    }, 200)
    expect(result.crossModalBridges).toHaveLength(0)
  })
})
