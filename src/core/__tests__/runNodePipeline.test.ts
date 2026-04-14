import { describe, it, expect } from 'vitest'
import { runNodePipeline } from '../runNodePipeline'

describe('runNodePipeline', () => {
  describe('Case A: clear keyword input (転職・疲労)', () => {
    const result = runNodePipeline('仕事に対して意欲が湧かない、転職すべきか悩んでいる')

    it('activates at least one node', () => {
      expect(result.activatedNodes.length).toBeGreaterThanOrEqual(1)
    })

    it('activates fatigue node', () => {
      expect(result.activatedNodes.some((n) => n.id === 'fatigue')).toBe(true)
    })

    it('activates wanting_change node', () => {
      expect(result.activatedNodes.some((n) => n.id === 'wanting_change')).toBe(true)
    })

    it('activates leaving node', () => {
      expect(result.activatedNodes.some((n) => n.id === 'leaving')).toBe(true)
    })

    it('activates safety or anxiety node', () => {
      const nodeIds = result.activatedNodes.map((n) => n.id)
      expect(nodeIds.includes('safety') || nodeIds.includes('anxiety')).toBe(true)
    })

    it('produces at least one binding', () => {
      expect(result.bindings.length).toBeGreaterThan(0)
    })

    it('returns a stateVector', () => {
      expect(result.stateVector).toBeDefined()
      expect(typeof result.stateVector.fragility).toBe('number')
    })

    it('includes numeric meta values', () => {
      expect(typeof result.meta.retrievalCount).toBe('number')
      expect(result.meta.retrievalCount).toBeGreaterThan(0)
      expect(typeof result.meta.bindingCount).toBe('number')
      expect(typeof result.meta.elapsedMs).toBe('number')
    })
  })

  describe('Case B: vague input (曖昧)', () => {
    const result = runNodePipeline('なんとなく引っかかるけど、まだ言葉にできない')

    it('activates ambiguity node', () => {
      expect(result.activatedNodes.some((n) => n.id === 'ambiguity')).toBe(true)
    })

    it('activates vague_discomfort node', () => {
      expect(result.activatedNodes.some((n) => n.id === 'vague_discomfort')).toBe(true)
    })

    it('lifts unarticulated_feeling pattern', () => {
      expect(result.liftedPatterns.some((p) => p.id === 'unarticulated_feeling')).toBe(true)
    })

    it('suppresses clarity or articulation', () => {
      const suppIds = result.suppressedNodes.map((n) => n.id)
      expect(suppIds.includes('clarity') || suppIds.includes('articulation')).toBe(true)
    })
  })

  describe('Case C: no-match input (fallback)', () => {
    const result = runNodePipeline('abcxyz')

    it('activates processing fallback node', () => {
      expect(result.activatedNodes.some((n) => n.id === 'processing')).toBe(true)
    })

    it('does not throw and returns valid arrays', () => {
      expect(Array.isArray(result.bindings)).toBe(true)
      expect(Array.isArray(result.liftedPatterns)).toBe(true)
    })

    it('returns a complete result object without exception', () => {
      expect(result.stateVector).toBeDefined()
      expect(result.meta).toBeDefined()
    })
  })
})
