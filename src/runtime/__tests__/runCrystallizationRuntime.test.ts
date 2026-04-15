import { describe, expect, it } from 'vitest'
import { runCrystallizationRuntime } from '../runCrystallizationRuntime'

describe('runCrystallizationRuntime', () => {
  it('does not jump directly from boot to reply generation', () => {
    const result = runCrystallizationRuntime('疲れていて、転職すべきか迷っている', 'internal_mock')
    const sourceIndex = result.debugNotes.findIndex((note) => note.includes('Source boot'))
    const deconditioningIndex = result.debugNotes.findIndex((note) => note.includes('Deconditioning started'))
    const homeIndex = result.debugNotes.findIndex((note) => note.includes('Home return executed'))
    const coActivationIndex = result.debugNotes.findIndex((note) => note.includes('Co-activation started'))
    const decisionIndex = result.debugNotes.findIndex((note) => note.includes('Self decision started'))
    const utteranceIndex = result.debugNotes.findIndex((note) => note.includes('Utterance rendered'))

    expect(sourceIndex).toBeGreaterThan(-1)
    expect(deconditioningIndex).toBeGreaterThan(sourceIndex)
    expect(homeIndex).toBeGreaterThan(deconditioningIndex)
    expect(coActivationIndex).toBeGreaterThan(homeIndex)
    expect(decisionIndex).toBeGreaterThan(coActivationIndex)
    expect(utteranceIndex).toBeGreaterThan(decisionIndex)
  })
})
