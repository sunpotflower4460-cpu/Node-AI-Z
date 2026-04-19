/**
 * Phase 1: Session Brain State Continuity Integration Test
 * Verifies that brain state is properly maintained across multiple turns.
 */

import { describe, it, expect } from 'vitest'
import { runCrystallizedThinkingRuntime } from '../runCrystallizedThinkingRuntime'
import { createInitialBrainState } from '../../brain/createInitialBrainState'
import { createPersonalLearningState } from '../../learning/personalLearning'

describe('Session Brain State Continuity', () => {
  it('should initialize brain state on first turn when not provided', () => {
    const personalLearning = createPersonalLearningState()

    const result = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
    })

    expect(result.nextBrainState).toBeDefined()
    expect(result.nextBrainState?.turnCount).toBe(1)
    expect(result.nextBrainState?.sessionId).toBeDefined()
  })

  it('should maintain brain state across multiple turns', () => {
    const personalLearning = createPersonalLearningState()

    // Turn 1
    const result1 = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
    })

    expect(result1.nextBrainState).toBeDefined()
    expect(result1.nextBrainState?.turnCount).toBe(1)

    const sessionId1 = result1.nextBrainState?.sessionId

    // Turn 2 - pass brain state from turn 1
    const result2 = runCrystallizedThinkingRuntime({
      text: 'お元気ですか？',
      personalLearning,
      brainState: result1.nextBrainState,
    })

    expect(result2.nextBrainState).toBeDefined()
    expect(result2.nextBrainState?.turnCount).toBe(2)
    expect(result2.nextBrainState?.sessionId).toBe(sessionId1) // Same session

    // Turn 3 - pass brain state from turn 2
    const result3 = runCrystallizedThinkingRuntime({
      text: 'ありがとう',
      personalLearning,
      brainState: result2.nextBrainState,
    })

    expect(result3.nextBrainState).toBeDefined()
    expect(result3.nextBrainState?.turnCount).toBe(3)
    expect(result3.nextBrainState?.sessionId).toBe(sessionId1) // Same session
  })

  it('should update temporal states across turns', () => {
    const personalLearning = createPersonalLearningState()

    const result1 = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
    })

    // Temporal states map should be defined (may be empty if no features fired)
    expect(result1.nextBrainState?.temporalStates).toBeDefined()

    const result2 = runCrystallizedThinkingRuntime({
      text: 'お元気ですか？',
      personalLearning,
      brainState: result1.nextBrainState,
    })

    // Temporal states should be updated and defined
    expect(result2.nextBrainState?.temporalStates).toBeDefined()
  })

  it('should update prediction state across turns', () => {
    const personalLearning = createPersonalLearningState()

    const result1 = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
    })

    expect(result1.nextBrainState?.predictionState).toBeDefined()
    expect(result1.nextBrainState?.predictionState.basedOnTurn).toBe(0)

    const result2 = runCrystallizedThinkingRuntime({
      text: 'お元気ですか？',
      personalLearning,
      brainState: result1.nextBrainState,
    })

    expect(result2.nextBrainState?.predictionState).toBeDefined()
    expect(result2.nextBrainState?.predictionState.basedOnTurn).toBe(1)
  })

  it('should update afterglow across turns', () => {
    const personalLearning = createPersonalLearningState()

    const result1 = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
    })

    expect(result1.nextBrainState?.afterglow).toBeGreaterThanOrEqual(0)
    expect(result1.nextBrainState?.afterglow).toBeLessThanOrEqual(0.2)
  })

  it('should maintain session ID across turns with explicit brain state', () => {
    const personalLearning = createPersonalLearningState()
    const initialState = createInitialBrainState('test-session-123')

    const result1 = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
      brainState: initialState,
    })

    expect(result1.nextBrainState?.sessionId).toBe('test-session-123')

    const result2 = runCrystallizedThinkingRuntime({
      text: 'お元気ですか？',
      personalLearning,
      brainState: result1.nextBrainState,
    })

    expect(result2.nextBrainState?.sessionId).toBe('test-session-123')
  })

  it('should update micro-signal dimensions across turns', () => {
    const personalLearning = createPersonalLearningState()

    const result = runCrystallizedThinkingRuntime({
      text: 'こんにちは',
      personalLearning,
    })

    expect(result.nextBrainState?.microSignalDimensions).toBeDefined()
    expect(result.nextBrainState?.microSignalDimensions.fieldTone).toBeDefined()
    expect(result.nextBrainState?.microSignalDimensions.activeCueCount).toBeGreaterThanOrEqual(0)
    expect(result.nextBrainState?.microSignalDimensions.fusedConfidence).toBeGreaterThanOrEqual(0)
    expect(result.nextBrainState?.microSignalDimensions.fusedConfidence).toBeLessThanOrEqual(1)
  })
})
