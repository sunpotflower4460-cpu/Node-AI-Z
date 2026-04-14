import { describe, it, expect } from 'vitest'
import { applyRelationBoost, applyPatternBoost, buildRelationBoostKey, getHomeTriggerThresholds } from '../applyPlasticity'
import { applyUserTuning } from '../applyUserTuning'
import { buildProposedChanges } from '../buildProposedChanges'
import { createDefaultPlasticityState } from '../defaultPlasticityState'
import { createDefaultRevisionState } from '../defaultRevisionState'
import type { PlasticityState, ProposedChange, RevisionEntry } from '../types'
import { runNodePipeline } from '../../core/runNodePipeline'
import { buildStudioViewModel } from '../../studio/buildStudioViewModel'

const makeStateWithEntry = () => {
  const change: ProposedChange = {
    id: 'change_1',
    kind: 'tone_bias',
    key: 'over_explaining',
    delta: -0.04,
    reason: 'test reason',
    status: 'ephemeral',
  }
  const entry: RevisionEntry = {
    id: 'entry_1',
    timestamp: new Date().toISOString(),
    inputText: 'test input',
    rawReply: '',
    adjustedReply: '',
    issueTags: [],
    note: '',
    proposedChanges: [change],
    status: 'ephemeral',
  }
  const state = createDefaultRevisionState()
  return {
    state: { ...state, memory: { ...state.memory, entries: [entry] } },
    entryId: 'entry_1',
    changeId: 'change_1',
  }
}

describe('applyPlasticity', () => {
  describe('applyRelationBoost', () => {
    it('increases weight when boost is positive', () => {
      const plasticity: PlasticityState = {
        ...createDefaultPlasticityState(),
        relationBoosts: { 'fatigue->routine': 0.05 },
      }
      const key = buildRelationBoostKey('fatigue', 'routine')
      const boosted = applyRelationBoost(0.5, key, plasticity)
      expect(boosted).toBeGreaterThan(0.5)
    })

    it('decreases weight when boost is negative', () => {
      const plasticity: PlasticityState = {
        ...createDefaultPlasticityState(),
        relationBoosts: { 'fatigue->routine': -0.05 },
      }
      const key = buildRelationBoostKey('fatigue', 'routine')
      const boosted = applyRelationBoost(0.5, key, plasticity)
      expect(boosted).toBeLessThan(0.5)
    })

    it('clamps result to 0.99 maximum', () => {
      const plasticity: PlasticityState = {
        ...createDefaultPlasticityState(),
        relationBoosts: { 'x->y': 0.5 },
      }
      const boosted = applyRelationBoost(0.99, 'x->y', plasticity)
      expect(boosted).toBeLessThanOrEqual(0.99)
    })

    it('clamps result to 0 minimum', () => {
      const plasticity: PlasticityState = {
        ...createDefaultPlasticityState(),
        relationBoosts: { 'x->y': -0.5 },
      }
      const boosted = applyRelationBoost(0, 'x->y', plasticity)
      expect(boosted).toBeGreaterThanOrEqual(0)
    })
  })

  describe('applyPatternBoost', () => {
    it('increases score when boost is positive', () => {
      const plasticity: PlasticityState = {
        ...createDefaultPlasticityState(),
        patternBoosts: { motivation_drift: 0.05 },
      }
      const boosted = applyPatternBoost(0.5, 'motivation_drift', plasticity)
      expect(boosted).toBeGreaterThan(0.5)
    })

    it('returns original score when no boost is set', () => {
      const plasticity = createDefaultPlasticityState()
      const score = applyPatternBoost(0.6, 'unknown_pattern', plasticity)
      expect(score).toBeCloseTo(0.6)
    })
  })

  describe('getHomeTriggerThresholds', () => {
    it('returns default thresholds without plasticity', () => {
      const thresholds = getHomeTriggerThresholds()
      expect(thresholds.overperformance).toBeCloseTo(0.72)
      expect(thresholds.ambiguityOverload).toBeCloseTo(0.8)
      expect(thresholds.fragility).toBeCloseTo(0.72)
      expect(thresholds.trustDrop).toBeCloseTo(0.45)
    })

    it('adjusts thresholds with homeTriggerBoosts', () => {
      const plasticity: PlasticityState = {
        ...createDefaultPlasticityState(),
        homeTriggerBoosts: { overperformance: 0.05 },
      }
      const thresholds = getHomeTriggerThresholds(plasticity)
      expect(thresholds.overperformance).toBeLessThan(0.72)
    })
  })
})

describe('buildProposedChanges', () => {
  it('returns changes and issues arrays for normal input', () => {
    const result = runNodePipeline('仕事に対する意欲が湧かなくて、転職すべきか悩んでいる')
    const view = buildStudioViewModel(result)
    const { changes, issues } = buildProposedChanges(result, view)
    expect(Array.isArray(changes)).toBe(true)
    expect(Array.isArray(issues)).toBe(true)
  })

  it('does not throw for fallback input', () => {
    const result = runNodePipeline('abcxyz')
    const view = buildStudioViewModel(result)
    expect(() => buildProposedChanges(result, view)).not.toThrow()
  })

  it('each change has required fields', () => {
    const result = runNodePipeline('仕事に対する意欲が湧かなくて、転職すべきか悩んでいる')
    const view = buildStudioViewModel(result)
    const { changes } = buildProposedChanges(result, view)
    for (const change of changes) {
      expect(typeof change.id).toBe('string')
      expect(typeof change.kind).toBe('string')
      expect(typeof change.key).toBe('string')
      expect(typeof change.delta).toBe('number')
      expect(typeof change.reason).toBe('string')
    }
  })
})

describe('applyUserTuning', () => {
  it('keep action adds changeId to kept set', () => {
    const { state, entryId, changeId } = makeStateWithEntry()
    const next = applyUserTuning(state, entryId, changeId, 'keep')
    expect(next.tuning.kept.has(changeId)).toBe(true)
    expect(next.tuning.softened.has(changeId)).toBe(false)
    expect(next.tuning.reverted.has(changeId)).toBe(false)
  })

  it('soften action adds changeId to softened set', () => {
    const { state, entryId, changeId } = makeStateWithEntry()
    const next = applyUserTuning(state, entryId, changeId, 'soften')
    expect(next.tuning.softened.has(changeId)).toBe(true)
    expect(next.tuning.kept.has(changeId)).toBe(false)
  })

  it('revert action adds changeId to reverted set', () => {
    const { state, entryId, changeId } = makeStateWithEntry()
    const next = applyUserTuning(state, entryId, changeId, 'revert')
    expect(next.tuning.reverted.has(changeId)).toBe(true)
    expect(next.tuning.kept.has(changeId)).toBe(false)
  })

  it('lock action adds changeId to locked set', () => {
    const { state, entryId, changeId } = makeStateWithEntry()
    const next = applyUserTuning(state, entryId, changeId, 'lock')
    expect(next.tuning.locked.has(changeId)).toBe(true)
  })

  it('revert changes the entry status to reverted', () => {
    const { state, entryId, changeId } = makeStateWithEntry()
    const next = applyUserTuning(state, entryId, changeId, 'revert')
    const entry = next.memory.entries.find((e) => e.id === entryId)
    expect(entry?.status).toBe('reverted')
  })

  it('does not throw with unknown entryId', () => {
    const { state, changeId } = makeStateWithEntry()
    expect(() => applyUserTuning(state, 'nonexistent_entry', changeId, 'keep')).not.toThrow()
  })

  it('does not throw with empty revision state', () => {
    const state = createDefaultRevisionState()
    expect(() => applyUserTuning(state, 'entry_1', 'change_1', 'keep')).not.toThrow()
  })
})
