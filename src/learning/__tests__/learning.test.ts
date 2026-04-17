import { describe, it, expect } from 'vitest'
import {
  createSessionLearningState,
  updateSessionLearning,
} from '../sessionLearning'
import {
  createPersonalLearningState,
  updatePersonalLearning,
} from '../personalLearning'
import {
  createGlobalCandidateState,
  updateGlobalCandidates,
} from '../globalCandidateLearning'
import { applyPathwayPlasticity } from '../applyPathwayPlasticity'
import { extractPathwayKeys } from '../pathwayKeys'
import type { Signal } from '../../signal/types'

// ── extractPathwayKeys ──────────────────────────────────────────────────────

describe('extractPathwayKeys', () => {
  it('returns "<id>:<trigger>" keys for signals with pathways', () => {
    const signals: Signal[] = [
      { id: 'self_exhaustion', layer: 'self', label: '自己疲弊', strength: 0.7, pathways: ['疲れ', 'しんどい'] },
    ]
    const keys = extractPathwayKeys(signals)
    expect(keys).toContain('self_exhaustion:疲れ')
    expect(keys).toContain('self_exhaustion:しんどい')
  })

  it('returns "<id>" for signals with no pathways (fallback)', () => {
    const signals: Signal[] = [
      { id: 'ambient_unease', layer: 'field', label: '漠然とした不安', strength: 0.3, pathways: [] },
    ]
    const keys = extractPathwayKeys(signals)
    expect(keys).toContain('ambient_unease')
    expect(keys).toHaveLength(1)
  })

  it('returns an empty array for empty signals', () => {
    expect(extractPathwayKeys([])).toEqual([])
  })
})

// ── Session learning ────────────────────────────────────────────────────────

describe('sessionLearning', () => {
  it('creates a blank state with zero turns', () => {
    const state = createSessionLearningState('sess-1')
    expect(state.turnCount).toBe(0)
    expect(state.reinforcedKeys).toEqual([])
    expect(Object.keys(state.pathwayStrengths)).toHaveLength(0)
  })

  it('reinforces fired keys after one turn', () => {
    const state = createSessionLearningState('sess-1')
    const next = updateSessionLearning(state, ['self_exhaustion:疲れ'])
    expect(next.pathwayStrengths['self_exhaustion:疲れ']).toBeGreaterThan(0)
    expect(next.turnCount).toBe(1)
  })

  it('strength grows with repeated firing', () => {
    let state = createSessionLearningState('sess-1')
    for (let i = 0; i < 5; i++) {
      state = updateSessionLearning(state, ['self_exhaustion:疲れ'])
    }
    expect(state.pathwayStrengths['self_exhaustion:疲れ']).toBeGreaterThan(0.4)
  })

  it('strength never exceeds 1.0', () => {
    let state = createSessionLearningState('sess-1')
    for (let i = 0; i < 20; i++) {
      state = updateSessionLearning(state, ['some_key'])
    }
    expect(state.pathwayStrengths['some_key']).toBeLessThanOrEqual(1.0)
  })

  it('unfired keys are added to reinforcedKeys', () => {
    const state = createSessionLearningState('sess-1')
    const next = updateSessionLearning(state, ['key_a', 'key_b'])
    expect(next.reinforcedKeys).toContain('key_a')
    expect(next.reinforcedKeys).toContain('key_b')
  })

  it('does not mutate the original state', () => {
    const original = createSessionLearningState('sess-1')
    updateSessionLearning(original, ['key_a'])
    expect(original.turnCount).toBe(0)
    expect(Object.keys(original.pathwayStrengths)).toHaveLength(0)
  })
})

// ── Personal learning ───────────────────────────────────────────────────────

describe('personalLearning', () => {
  it('creates a blank state with zero turns', () => {
    const state = createPersonalLearningState()
    expect(state.totalTurns).toBe(0)
    expect(Object.keys(state.pathwayStrengths)).toHaveLength(0)
  })

  it('reinforces fired keys', () => {
    const state = createPersonalLearningState()
    const next = updatePersonalLearning(state, ['key_a'])
    expect(next.pathwayStrengths['key_a']).toBeGreaterThan(0)
    expect(next.totalTurns).toBe(1)
  })

  it('personal strength is lower than session strength after same turns', () => {
    let sessionState = { sessionId: 's', pathwayStrengths: {}, reinforcedKeys: [], turnCount: 0 }
    let personalState = createPersonalLearningState()
    for (let i = 0; i < 3; i++) {
      sessionState = updateSessionLearning(sessionState, ['key_a'])
      personalState = updatePersonalLearning(personalState, ['key_a'])
    }
    expect(sessionState.pathwayStrengths['key_a']).toBeGreaterThan(
      personalState.pathwayStrengths['key_a'],
    )
  })

  it('updates lastUpdated on each call', () => {
    const state = createPersonalLearningState()
    const next = updatePersonalLearning(state, ['key_a'])
    expect(next.lastUpdated).toBeTruthy()
  })
})

// ── Global candidate learning ───────────────────────────────────────────────

describe('globalCandidateLearning', () => {
  it('creates a blank state with no candidates', () => {
    const state = createGlobalCandidateState()
    expect(state.candidates).toHaveLength(0)
  })

  it('does not nominate keys below threshold', () => {
    const state = createGlobalCandidateState()
    const next = updateGlobalCandidates(state, ['key_a'], { key_a: 0.1 }, 'sess-1')
    expect(next.candidates).toHaveLength(0)
  })

  it('nominates keys at or above threshold (0.3)', () => {
    const state = createGlobalCandidateState()
    const next = updateGlobalCandidates(state, ['key_a'], { key_a: 0.5 }, 'sess-1')
    expect(next.candidates.length).toBeGreaterThan(0)
    expect(next.candidates[0].key).toBe('key_a')
  })

  it('records the nominating sessionId', () => {
    const state = createGlobalCandidateState()
    const next = updateGlobalCandidates(state, ['key_a'], { key_a: 0.5 }, 'my-session')
    expect(next.candidates[0].sessionId).toBe('my-session')
  })

  it('returns original state when no keys fire', () => {
    const state = createGlobalCandidateState()
    const next = updateGlobalCandidates(state, [], {}, 'sess-1')
    expect(next).toBe(state)
  })
})

// ── applyPathwayPlasticity ──────────────────────────────────────────────────

describe('applyPathwayPlasticity', () => {
  const baseSignal: Signal = {
    id: 'self_exhaustion',
    layer: 'self',
    label: '自己疲弊',
    strength: 0.5,
    pathways: ['疲れ'],
  }

  it('returns unmodified signal when no plasticity weights exist', () => {
    const session = createSessionLearningState('sess-1')
    const personal = createPersonalLearningState()
    const result = applyPathwayPlasticity([baseSignal], session, personal)
    expect(result[0]).toBe(baseSignal)
  })

  it('boosts signal strength when session pathway strength is set', () => {
    const session = { sessionId: 's', pathwayStrengths: { 'self_exhaustion:疲れ': 0.5 }, reinforcedKeys: [], turnCount: 1 }
    const personal = createPersonalLearningState()
    const result = applyPathwayPlasticity([baseSignal], session, personal)
    expect(result[0].strength).toBeGreaterThan(baseSignal.strength)
  })

  it('never exceeds strength of 0.99', () => {
    const session = { sessionId: 's', pathwayStrengths: { 'self_exhaustion:疲れ': 1.0, self_exhaustion: 1.0 }, reinforcedKeys: [], turnCount: 1 }
    const personal = { pathwayStrengths: { 'self_exhaustion:疲れ': 1.0, self_exhaustion: 1.0 }, lastUpdated: '', totalTurns: 1 }
    const result = applyPathwayPlasticity([baseSignal], session, personal)
    expect(result[0].strength).toBeLessThanOrEqual(0.99)
  })

  it('does not mutate the original signal', () => {
    const session = { sessionId: 's', pathwayStrengths: { 'self_exhaustion:疲れ': 0.5 }, reinforcedKeys: [], turnCount: 1 }
    const personal = createPersonalLearningState()
    applyPathwayPlasticity([baseSignal], session, personal)
    expect(baseSignal.strength).toBe(0.5)
  })
})
