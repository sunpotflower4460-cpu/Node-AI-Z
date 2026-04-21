import { describe, expect, it } from 'vitest'
import {
  coerceAiSenseiRawResponse,
  parseAiSenseiResponse,
} from '../parseAiSenseiResponse'

describe('parseAiSenseiResponse', () => {
  it('parses structured responses into normalized reviews', () => {
    const parsed = parseAiSenseiResponse({
      decision: 'approve',
      confidence: 0.91,
      reasons: ['Looks safe'],
      cautionNotes: ['Track later'],
    })

    expect(parsed).toEqual({
      success: true,
      decision: 'approve',
      confidence: 0.91,
      reasons: ['Looks safe'],
      cautionNotes: ['Track later'],
      parseNotes: [],
    })
  })

  it('parses JSON text responses and preserves raw summary', () => {
    const raw = coerceAiSenseiRawResponse(
      '{"decision":"reject","confidence":0.77,"reasons":["Too risky"]}'
    )
    const parsed = parseAiSenseiResponse(raw)

    expect(raw?.decision).toBe('reject')
    expect(parsed.success).toBe(true)
    expect(parsed.decision).toBe('reject')
  })

  it('fails safely on malformed responses', () => {
    const parsed = parseAiSenseiResponse('not a valid guardian verdict')

    expect(parsed.success).toBe(false)
    expect(parsed.decision).toBe('hold_for_review')
    expect(parsed.confidence).toBe(0.5)
    expect(parsed.parseNotes).toContain(
      'Missing or invalid decision in AI sensei response'
    )
  })
})
