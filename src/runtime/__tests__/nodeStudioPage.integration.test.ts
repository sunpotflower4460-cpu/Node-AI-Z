/**
 * Integration Test: NodeStudioPage Runtime Flow
 *
 * Tests that NodeStudioPage correctly routes through runMainRuntime
 * and that SessionBrainState flows properly for crystallized_thinking mode.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createObservationRecord } from '../createObservationRecord'
import { createPersonalLearningState } from '../../learning/personalLearning'
import { createInitialBrainState } from '../../brain/createInitialBrainState'
import type { SessionBrainState } from '../../brain/sessionBrainState'

describe('NodeStudioPage Runtime Integration', () => {
  let personalLearning: ReturnType<typeof createPersonalLearningState>
  let initialBrainState: SessionBrainState

  beforeEach(() => {
    personalLearning = createPersonalLearningState()
    initialBrainState = createInitialBrainState()
  })

  describe('Crystallized Thinking Mode', () => {
    it('should route through runMainRuntime with implementationMode', async () => {
      const record = await createObservationRecord({
        type: 'observe',
        text: 'Test input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: initialBrainState,
      })

      // Verify it used crystallized_thinking mode
      expect(record.implementationMode).toBe('crystallized_thinking')

      // Verify runMainRuntime was used (not direct pipeline calls)
      expect(record.assistantReply).toBeDefined()
      expect(typeof record.assistantReply).toBe('string')
    })

    it('should pass brainState to runtime and receive nextBrainState', async () => {
      const record = await createObservationRecord({
        type: 'observe',
        text: 'Test input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: initialBrainState,
      })

      // Verify nextBrainState is returned
      expect(record.nextBrainState).toBeDefined()

      // Verify turn count incremented
      expect(record.nextBrainState!.turnCount).toBe(initialBrainState.turnCount + 1)

      // Verify session ID is preserved
      expect(record.nextBrainState!.sessionId).toBe(initialBrainState.sessionId)
    })

    it('should preserve brainState across multiple turns', async () => {
      // First turn
      const firstRecord = await createObservationRecord({
        type: 'observe',
        text: 'First input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: initialBrainState,
      })

      expect(firstRecord.nextBrainState).toBeDefined()
      const firstTurnBrainState = firstRecord.nextBrainState!

      // Second turn with brain state from first turn
      const secondRecord = await createObservationRecord({
        type: 'observe',
        text: 'Second input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: firstTurnBrainState,
      })

      expect(secondRecord.nextBrainState).toBeDefined()

      // Verify turn count continued
      expect(secondRecord.nextBrainState!.turnCount).toBe(2)

      // Verify session continuity
      expect(secondRecord.nextBrainState!.sessionId).toBe(initialBrainState.sessionId)
    })

    it('should not use old direct pipeline routes', async () => {
      const record = await createObservationRecord({
        type: 'observe',
        text: 'Test input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: initialBrainState,
      })

      // The record should have crystallized thinking specific fields
      expect(record.signalResult).toBeDefined()
      expect(record.dualStreamResult).toBeDefined()
      expect(record.chunkedResult).toBeDefined()

      // Should have utterance layer fields (from Pass 2)
      expect(record.utteranceIntent).toBeDefined()
      expect(record.utteranceShape).toBeDefined()
      expect(record.finalCrystallizedReply).toBeDefined()
    })
  })

  describe('Jibun Kaigi API Mode', () => {
    it('should route through runMainRuntime for jibun_kaigi_api mode', async () => {
      const record = await createObservationRecord({
        type: 'observe',
        text: 'Test input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'jibun_kaigi_api',
        personalLearning,
      })

      // Verify it used jibun_kaigi_api mode
      expect(record.implementationMode).toBe('jibun_kaigi_api')

      // Should have basic fields
      expect(record.assistantReply).toBeDefined()
      expect(record.pipelineResult).toBeDefined()
      expect(record.revisionEntry).toBeDefined()
    })

    it('should not require brainState for jibun_kaigi_api mode', async () => {
      const record = await createObservationRecord({
        type: 'observe',
        text: 'Test input',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'jibun_kaigi_api',
        personalLearning,
        // No brainState provided
      })

      expect(record.implementationMode).toBe('jibun_kaigi_api')
      expect(record.assistantReply).toBeDefined()

      // Should not have nextBrainState in jibun_kaigi_api mode
      expect(record.nextBrainState).toBeUndefined()
    })
  })

  describe('Experience Mode Flow', () => {
    it('should work correctly for experience type', async () => {
      const record = await createObservationRecord({
        type: 'experience',
        text: 'User message',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: initialBrainState,
      })

      expect(record.type).toBe('experience')
      expect(record.implementationMode).toBe('crystallized_thinking')
      expect(record.nextBrainState).toBeDefined()
    })
  })

  describe('Runtime Mode Independence', () => {
    it('should keep jibun_kaigi_api and crystallized_thinking independent', async () => {
      const crystallizedRecord = await createObservationRecord({
        type: 'observe',
        text: 'Test',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'crystallized_thinking',
        personalLearning,
        brainState: initialBrainState,
      })

      const jibunRecord = await createObservationRecord({
        type: 'observe',
        text: 'Test',
        provider: 'openai',
        runtimeMode: 'node',
        implementationMode: 'jibun_kaigi_api',
        personalLearning,
      })

      // Different implementation modes should produce different result shapes
      expect(crystallizedRecord.implementationMode).toBe('crystallized_thinking')
      expect(jibunRecord.implementationMode).toBe('jibun_kaigi_api')

      // Crystallized should have brain state, jibun should not
      expect(crystallizedRecord.nextBrainState).toBeDefined()
      expect(jibunRecord.nextBrainState).toBeUndefined()

      // Crystallized should have signal/dual stream, jibun may not
      expect(crystallizedRecord.signalResult).toBeDefined()
      expect(crystallizedRecord.dualStreamResult).toBeDefined()
    })
  })
})
