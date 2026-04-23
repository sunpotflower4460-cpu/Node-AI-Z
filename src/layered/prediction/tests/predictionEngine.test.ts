import { describe, it, expect } from 'vitest'
import { generatePrediction, computePredictionError } from '../predictionEngine'
import type { Decision } from '../../L6/types'
import type { SemanticFrame } from '../../L4/types'
import type { Prediction } from '../types'

describe('predictionEngine', () => {
  describe('generatePrediction', () => {
    it('should predict connection need and greeting_question for greet_back with askBack', () => {
      const decision: Decision = {
        action: 'greet_back',
        topic: '挨拶',
        length: 'short',
        confidence: 0.8,
        showUncertainty: false,
        askBack: true,
        reasoning: '挨拶として受け取ったので返す',
        warmthBand: 'warm',
      }
      const semanticFrame: SemanticFrame = {
        gist: '挨拶を求めている',
        need: 'connection',
        contextModifier: null,
        relation: 'new_topic',
      }

      const prediction = generatePrediction(decision, semanticFrame)

      expect(prediction.expectedNeed).toBe('connection')
      expect(prediction.expectedSentenceType).toBe('greeting_question')
      expect(prediction.expectedTopic).not.toBe('')
      expect(prediction.expectedTopic).toBe('挨拶')
    })

    it('should predict acknowledgment need and reaction for answer action', () => {
      const decision: Decision = {
        action: 'answer',
        topic: 'ブラックホール',
        length: 'medium',
        confidence: 0.8,
        showUncertainty: false,
        askBack: false,
        reasoning: '情報を求められているので答える',
        warmthBand: 'neutral',
      }
      const semanticFrame: SemanticFrame = {
        gist: 'ブラックホールについて知りたい',
        need: 'information',
        contextModifier: null,
        relation: 'new_topic',
      }

      const prediction = generatePrediction(decision, semanticFrame)

      expect(prediction.expectedNeed).toBe('acknowledgment')
      expect(prediction.expectedSentenceType).toBe('reaction')
      expect(prediction.expectedTopic).not.toBe('')
      expect(prediction.expectedTopic).toBe('ブラックホール')
    })

    it('should extract topic correctly with multiple patterns', () => {
      const decision: Decision = {
        action: 'listen',
        topic: '人生',
        length: 'short',
        confidence: 0.75,
        showUncertainty: false,
        askBack: false,
        reasoning: '気持ちが出ているのでまず聞く',
        warmthBand: 'neutral',
      }
      const semanticFrame: SemanticFrame = {
        gist: '人生について一緒に考えたい',
        need: 'reflection',
        contextModifier: null,
        relation: 'new_topic',
      }

      const prediction = generatePrediction(decision, semanticFrame)

      expect(prediction.expectedTopic).toBe('人生')
    })

    it('should extract topic with "という" pattern', () => {
      const decision: Decision = {
        action: 'listen',
        topic: 'モヤモヤ',
        length: 'short',
        confidence: 0.75,
        showUncertainty: false,
        askBack: false,
        reasoning: '気持ちが出ているのでまず聞く',
        warmthBand: 'neutral',
      }
      const semanticFrame: SemanticFrame = {
        gist: 'モヤモヤという気持ちを出している',
        need: 'expression',
        contextModifier: null,
        relation: 'new_topic',
      }

      const prediction = generatePrediction(decision, semanticFrame)

      expect(prediction.expectedTopic).toBe('モヤモヤ')
    })
  })

  describe('computePredictionError', () => {
    it('should return no error when prediction matches actual', () => {
      const prediction: Prediction = {
        expectedNeed: 'connection',
        expectedTopic: '挨拶',
        expectedSentenceType: 'greeting_question',
      }
      const actual: SemanticFrame = {
        gist: '挨拶を返している',
        need: 'connection',
        contextModifier: null,
        relation: 'response',
      }

      const error = computePredictionError(prediction, actual)

      expect(error.needMismatch).toBe(false)
      expect(error.topicShift).toBe(false)
      expect(error.surprise).toBe(0)
    })

    it('should detect need mismatch and calculate surprise >= 0.5', () => {
      const prediction: Prediction = {
        expectedNeed: 'acknowledgment',
        expectedTopic: 'ブラックホール',
        expectedSentenceType: 'reaction',
      }
      const actual: SemanticFrame = {
        gist: '人生について考えたい',
        need: 'reflection',
        contextModifier: null,
        relation: 'new_topic',
      }

      const error = computePredictionError(prediction, actual)

      expect(error.needMismatch).toBe(true)
      expect(error.surprise).toBeGreaterThanOrEqual(0.5)
    })

    it('should detect topic shift and calculate surprise >= 0.3', () => {
      const prediction: Prediction = {
        expectedNeed: 'reflection',
        expectedTopic: 'ブラックホール',
        expectedSentenceType: 'opinion_question',
      }
      const actual: SemanticFrame = {
        gist: '人生について考えたい',
        need: 'reflection',
        contextModifier: null,
        relation: 'new_topic',
      }

      const error = computePredictionError(prediction, actual)

      expect(error.topicShift).toBe(true)
      expect(error.surprise).toBeGreaterThanOrEqual(0.3)
    })

    it('should detect relation shift and add to surprise', () => {
      const prediction: Prediction = {
        expectedNeed: 'expression',
        expectedTopic: '気持ち',
        expectedSentenceType: 'feeling_expression',
      }
      const actual: SemanticFrame = {
        gist: '元気ですかと挨拶している',
        need: 'connection',
        contextModifier: null,
        relation: 'shift',
      }

      const error = computePredictionError(prediction, actual)

      expect(error.surprise).toBeGreaterThanOrEqual(0.2)
    })

    it('should accumulate surprise from multiple mismatches', () => {
      const prediction: Prediction = {
        expectedNeed: 'acknowledgment',
        expectedTopic: 'ブラックホール',
        expectedSentenceType: 'reaction',
      }
      const actual: SemanticFrame = {
        gist: '人生について考えたい',
        need: 'reflection',
        contextModifier: null,
        relation: 'shift',
      }

      const error = computePredictionError(prediction, actual)

      expect(error.needMismatch).toBe(true)
      expect(error.topicShift).toBe(true)
      // needMismatch (0.5) + topicShift (0.3) + shift (0.2) = 1.0
      expect(error.surprise).toBe(1.0)
    })

    it('should clamp surprise to maximum of 1.0', () => {
      const prediction: Prediction = {
        expectedNeed: 'acknowledgment',
        expectedTopic: 'test',
        expectedSentenceType: 'reaction',
      }
      const actual: SemanticFrame = {
        gist: 'completely different topic',
        need: 'reflection',
        contextModifier: null,
        relation: 'shift',
      }

      const error = computePredictionError(prediction, actual)

      expect(error.surprise).toBeLessThanOrEqual(1.0)
    })
  })
})
