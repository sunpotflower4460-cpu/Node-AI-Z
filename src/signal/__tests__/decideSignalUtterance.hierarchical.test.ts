import { describe, expect, it } from 'vitest'
import { decideSignalUtterance } from '../decideSignalUtterance'

describe('decideSignalUtterance — hierarchical proto meanings', () => {
  it('uses narrative as the main decision input', () => {
    const decision = decideSignalUtterance({
      sensory: [
        { id: 'sensory:heavy', level: 'sensory', glossJa: '重い', strength: 0.82, sourceCueIds: [], sourceNodeIds: [] },
        { id: 'sensory:pressed', level: 'sensory', glossJa: '押されている', strength: 0.76, sourceCueIds: [], sourceNodeIds: [] },
      ],
      narrative: [
        {
          id: 'narrative:do_not_push_yet',
          level: 'narrative',
          glossJa: 'まだ押さない方がよい',
          strength: 0.88,
          sourceCueIds: [],
          sourceNodeIds: [],
          childIds: ['sensory:heavy', 'sensory:pressed'],
        },
      ],
      all: [],
    }, 0.72, 0.28)

    expect(decision.utteranceMode).toBe('boundary')
    expect(decision.replyIntent).toBe('boundary_hold')
    expect(decision.withheldBias).toBeGreaterThan(0.3)
    expect(decision.pathwayKeys?.[0]).toContain('narrative:まだ押さない方がよい')
  })

  it('raises step-offer bias for new-direction narratives', () => {
    const decision = decideSignalUtterance({
      sensory: [
        { id: 'sensory:open', level: 'sensory', glossJa: '開いている', strength: 0.74, sourceCueIds: [], sourceNodeIds: [] },
      ],
      narrative: [
        {
          id: 'narrative:new_direction',
          level: 'narrative',
          glossJa: '新しい方向を探し始めている',
          strength: 0.86,
          sourceCueIds: [],
          sourceNodeIds: [],
          childIds: ['sensory:open'],
        },
      ],
      all: [],
    }, 0.2, 0.4)

    expect(decision.utteranceMode).toBe('reflective')
    expect(decision.replyIntent).toBe('soft_answer_offer_step')
    expect(decision.shouldOfferStep).toBe(true)
  })
})
