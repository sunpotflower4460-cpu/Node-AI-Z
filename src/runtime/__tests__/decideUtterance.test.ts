import { describe, expect, it } from 'vitest'
import { decideUtterance } from '../decideUtterance'

describe('decideUtterance', () => {
  it('creates a self decision before utterance rendering', () => {
    const decision = decideUtterance(
      {
        gravity: 0.62,
        closeness: 0.71,
        urgency: 0.34,
        fragility: 0.74,
        permission: 0.68,
        ambiguity: 0.72,
        distance: 0.34,
        answerPressure: 0.44,
        stayWithNotKnowing: 0.81,
        stateVector: {
          fragility: 0.74,
          urgency: 0.34,
          depth: 0.6,
          care: 0.76,
          agency: 0.38,
          ambiguity: 0.72,
          change: 0.22,
          stability: 0.58,
          self: 0.62,
          relation: 0.71,
          light: 0.36,
          heaviness: 0.62,
        },
        atmosphere: 'まだ決めきらない方が自然な場',
        debugNotes: [],
      },
      {
        coreMeaning: 'まだ意味を固定しないこと',
        feltCenter: ['まだ意味を固定しないこと'],
        guardrails: ['断定を早めない'],
        withheld: ['明るいまとめ'],
        unknowns: ['中心がまだひとつに絞れていない'],
        debugNotes: [],
      },
      0.78,
    )

    expect(decision.stance).toBe('stay_open')
    expect(decision.replyIntent).toBe('hold_open')
    expect(decision.shouldStayOpen).toBe(true)
    expect(decision.shouldAnswerQuestion).toBe(false)
    expect(decision.withheldBias).toContain('false_brightness')
  })
})
