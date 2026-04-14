import { describe, it, expect } from 'vitest'
import { runNodePipeline } from '../../core/runNodePipeline'
import { buildStudioViewModel } from '../buildStudioViewModel'

describe('buildStudioViewModel', () => {
  describe('Case A: normal input (転職・疲労)', () => {
    const result = runNodePipeline('仕事に対する意欲が湧かなくて、転職すべきか悩んでいる')
    const view = buildStudioViewModel(result)

    it('returns a mainState', () => {
      expect(view.mainState).not.toBeNull()
    })

    it('generates responseMeta as an object with string fields', () => {
      expect(view.responseMeta).toBeDefined()
      expect(typeof view.responseMeta.temperature).toBe('string')
      expect(typeof view.responseMeta.withheld).toBe('string')
      expect(typeof view.responseMeta.wording).toBe('string')
      expect(typeof view.responseMeta.time).toBe('string')
    })

    it('returns internalProcess as a non-empty array', () => {
      expect(Array.isArray(view.internalProcess)).toBe(true)
      expect(view.internalProcess.length).toBeGreaterThan(0)
    })

    it('returns guideObserves with required fields', () => {
      expect(view.guideObserves).toBeDefined()
      expect(typeof view.guideObserves.summary).toBe('string')
      expect(typeof view.guideObserves.naturalnessAdvice).toBe('string')
      expect(Array.isArray(view.guideObserves.tags)).toBe(true)
    })

    it('returns rawReplyPreview as a non-empty string', () => {
      expect(typeof view.rawReplyPreview).toBe('string')
      expect(view.rawReplyPreview.length).toBeGreaterThan(0)
    })

    it('returns adjustedReplyPreview as a non-empty string', () => {
      expect(typeof view.adjustedReplyPreview).toBe('string')
      expect(view.adjustedReplyPreview.length).toBeGreaterThan(0)
    })
  })

  describe('Case B: fallback input (abcxyz)', () => {
    const result = runNodePipeline('abcxyz')
    const view = buildStudioViewModel(result)

    it('does not throw and returns a view object', () => {
      expect(view).toBeDefined()
    })

    it('returns a non-empty flowSummaryText', () => {
      expect(typeof view.flowSummaryText).toBe('string')
      expect(view.flowSummaryText.length).toBeGreaterThan(0)
    })

    it('handles null mainPattern gracefully', () => {
      expect(view.mainPattern).toBeNull()
    })

    it('still returns valid string replies', () => {
      expect(typeof view.rawReplyPreview).toBe('string')
      expect(typeof view.adjustedReplyPreview).toBe('string')
    })
  })
})
