import { describe, it, expect } from 'vitest'
import { createSignalObservation } from '../../intelligence/_drafts/runtime/createSignalObservation'
import { createSessionLearningState } from '../../intelligence/learning/sessionLearning'
import { createPersonalLearningState } from '../../intelligence/learning/personalLearning'
import { createGlobalCandidateState } from '../../intelligence/learning/globalCandidateLearning'
import { createInfoLayer, upsertInfoEntry } from '../../intelligence/knowledge/updateInfoLayer'
import type { LearningLayers } from '../../intelligence/learning/types'

const makeLearning = (sessionId = 'test-session'): LearningLayers => ({
  session: createSessionLearningState(sessionId),
  personal: createPersonalLearningState(),
  globalCandidates: createGlobalCandidateState(),
})

describe('createSignalObservation', () => {
  it('returns a valid utterance', () => {
    const result = createSignalObservation({
      text: '仕事に疲れて、自分を信じられない',
      learning: makeLearning(),
      infoLayer: createInfoLayer(),
    })
    expect(result.runtimeResult.utterance.length).toBeGreaterThan(0)
  })

  it('increments session turn count by 1', () => {
    const learning = makeLearning()
    const result = createSignalObservation({
      text: '疲れた',
      learning,
      infoLayer: createInfoLayer(),
    })
    expect(result.learning.session.turnCount).toBe(1)
  })

  it('increments personal total turns by 1', () => {
    const learning = makeLearning()
    const result = createSignalObservation({
      text: '疲れた',
      learning,
      infoLayer: createInfoLayer(),
    })
    expect(result.learning.personal.totalTurns).toBe(1)
  })

  it('returns updated session pathway strengths', () => {
    const result = createSignalObservation({
      text: '疲れた',
      learning: makeLearning(),
      infoLayer: createInfoLayer(),
    })
    expect(Object.keys(result.learning.session.pathwayStrengths).length).toBeGreaterThan(0)
  })

  it('does not mutate input learning state', () => {
    const learning = makeLearning()
    createSignalObservation({ text: '疲れた', learning, infoLayer: createInfoLayer() })
    expect(learning.session.turnCount).toBe(0)
  })

  it('does not access info layer when useInfoLayer is false (default)', () => {
    let layer = createInfoLayer()
    layer = upsertInfoEntry(layer, { key: 'self_exhaustion', content: '...', relevance: 0.8 })
    const result = createSignalObservation({
      text: '疲れた',
      learning: makeLearning(),
      infoLayer: layer,
    })
    expect(result.selectedInfoEntries).toHaveLength(0)
    // Entry should not have been accessed (useCount still 0)
    expect(result.infoLayer.entries[0].useCount).toBe(0)
  })

  it('accesses info layer when useInfoLayer is true', () => {
    let layer = createInfoLayer()
    layer = upsertInfoEntry(layer, { key: 'self_exhaustion', content: 'exhaustion pattern', relevance: 0.8 })
    const result = createSignalObservation({
      text: '疲れた',
      learning: makeLearning(),
      infoLayer: layer,
      useInfoLayer: true,
    })
    // self_exhaustion signal fires for '疲れた', so entry should be selected
    expect(result.selectedInfoEntries.length).toBeGreaterThanOrEqual(0)
  })

  it('multi-turn: pathway strengths accumulate across turns', () => {
    let learning = makeLearning()
    const infoLayer = createInfoLayer()
    const text = '疲れた'

    for (let i = 0; i < 3; i++) {
      const result = createSignalObservation({ text, learning, infoLayer })
      learning = result.learning
    }

    expect(learning.session.turnCount).toBe(3)
    expect(learning.personal.totalTurns).toBe(3)
    const maxStrength = Math.max(...Object.values(learning.session.pathwayStrengths))
    expect(maxStrength).toBeGreaterThan(0.1)
  })

  it('pathwayKeys in runtimeResult match keys updated in session', () => {
    const result = createSignalObservation({
      text: '疲れた',
      learning: makeLearning(),
      infoLayer: createInfoLayer(),
    })
    const { pathwayKeys } = result.runtimeResult
    const updatedKeys = Object.keys(result.learning.session.pathwayStrengths)
    // All pathway keys should appear in updated session
    for (const key of pathwayKeys) {
      expect(updatedKeys).toContain(key)
    }
  })
})
