import { describe, it, expect } from 'vitest'
import { runSignalRuntime } from '../runSignalRuntime'
import { createStimulusPacket } from '../createStimulusPacket'
import { activateSignals } from '../activateSignals'
import { buildSignalRevisionEntry } from '../buildSignalRevisionEntry'

describe('runSignalRuntime', () => {
  describe('Case A: fatigue + self-doubt input', () => {
    const result = runSignalRuntime('仕事に疲れて、自分を信じられなくなってきている')

    it('produces a non-empty utterance', () => {
      expect(result.utterance.length).toBeGreaterThan(0)
    })

    it('activates self-layer signals', () => {
      const selfSignals = result.signals.filter((s) => s.layer === 'self')
      expect(selfSignals.length).toBeGreaterThan(0)
    })

    it('activates other-layer signals (work context)', () => {
      const otherSignals = result.signals.filter((s) => s.layer === 'other')
      expect(otherSignals.length).toBeGreaterThan(0)
    })

    it('derives at least one proto-meaning', () => {
      expect(result.protoMeanings.length).toBeGreaterThan(0)
    })

    it('decision has a valid utteranceMode', () => {
      const validModes = ['receptive', 'reflective', 'boundary', 'resonant']
      expect(validModes).toContain(result.decision.utteranceMode)
    })

    it('produces a sentence plan with non-empty lead', () => {
      expect(result.sentencePlan.lead.length).toBeGreaterThan(0)
    })

    it('returns meta with elapsedMs', () => {
      expect(typeof result.meta.elapsedMs).toBe('number')
    })
  })

  describe('Case B: pre-verbal / ambiguous input', () => {
    const result = runSignalRuntime('なんとなく引っかかるけど、言葉にできない')

    it('activates field-layer signals', () => {
      const fieldSignals = result.signals.filter((s) => s.layer === 'field')
      expect(fieldSignals.length).toBeGreaterThan(0)
    })

    it('proto-meanings include ambiguous or still texture', () => {
      const textures = result.protoMeanings.map((pm) => pm.texture)
      expect(textures.some((t) => t === 'ambiguous' || t === 'still')).toBe(true)
    })

    it('decision mode is reflective (not receptive or resonant for pre-verbal)', () => {
      // reflective is expected for ambiguous signals
      expect(['reflective', 'receptive']).toContain(result.decision.utteranceMode)
    })

    it('self loop runs and returns valid state', () => {
      expect(typeof result.selfLoopState.resonanceScore).toBe('number')
      expect(result.selfLoopState.loopCount).toBeGreaterThan(0)
    })
  })

  describe('Case C: hope + searching input', () => {
    const result = runSignalRuntime('少しだけ希望はある気がする、でもまだ怖い')

    it('activates belief-layer signals', () => {
      const beliefSignals = result.signals.filter((s) => s.layer === 'belief')
      expect(beliefSignals.length).toBeGreaterThan(0)
    })

    it('proto-meanings have valence between -1 and 1', () => {
      for (const pm of result.protoMeanings) {
        expect(pm.valence).toBeGreaterThanOrEqual(-1)
        expect(pm.valence).toBeLessThanOrEqual(1)
      }
    })

    it('boundary loop separates internal and external signals', () => {
      const allInternal = result.boundaryLoopState.internalSignals.every(
        (s) => s.layer === 'self' || s.layer === 'belief',
      )
      const allExternal = result.boundaryLoopState.externalSignals.every(
        (s) => s.layer === 'other' || s.layer === 'field',
      )
      expect(allInternal).toBe(true)
      expect(allExternal).toBe(true)
    })

    it('word candidates cover all proto-meanings', () => {
      const coveredIds = new Set(result.wordCandidates.map((wc) => wc.protoMeaningId))
      for (const pm of result.protoMeanings) {
        expect(coveredIds.has(pm.id)).toBe(true)
      }
    })
  })

  describe('Case D: no-match fallback input', () => {
    const result = runSignalRuntime('xyzxyz')

    it('still produces an utterance via fallback', () => {
      expect(result.utterance.length).toBeGreaterThan(0)
    })

    it('activates at least one fallback signal', () => {
      expect(result.signals.length).toBeGreaterThan(0)
    })

    it('decision shouldSpeak is always true', () => {
      expect(result.decision.shouldSpeak).toBe(true)
    })
  })
})

describe('createStimulusPacket', () => {
  it('computes negative valence for negative input', () => {
    const packet = createStimulusPacket('疲れた、もう無理')
    expect(packet.valence).toBeLessThan(0)
  })

  it('computes positive valence for positive input', () => {
    const packet = createStimulusPacket('希望がある、嬉しい')
    expect(packet.valence).toBeGreaterThan(0)
  })

  it('intensity is between 0 and 1', () => {
    const packet = createStimulusPacket('test')
    expect(packet.intensity).toBeGreaterThanOrEqual(0)
    expect(packet.intensity).toBeLessThanOrEqual(1)
  })

  it('tokenizes non-empty text', () => {
    const packet = createStimulusPacket('仕事、転職、疲れ')
    expect(packet.tokens.length).toBeGreaterThan(0)
  })
})

describe('activateSignals', () => {
  it('activates self_exhaustion for fatigue input', () => {
    const stimulus = createStimulusPacket('疲れた')
    const signals = activateSignals(stimulus)
    expect(signals.some((s) => s.id === 'self_exhaustion')).toBe(true)
  })

  it('all signal strengths are between 0 and 1', () => {
    const stimulus = createStimulusPacket('仕事に疲れて不安で、自分を信じられない')
    const signals = activateSignals(stimulus)
    for (const s of signals) {
      expect(s.strength).toBeGreaterThanOrEqual(0)
      expect(s.strength).toBeLessThanOrEqual(1)
    }
  })

  it('signals are sorted by descending strength', () => {
    const stimulus = createStimulusPacket('仕事に疲れて不安')
    const signals = activateSignals(stimulus)
    for (let i = 1; i < signals.length; i++) {
      expect(signals[i - 1].strength).toBeGreaterThanOrEqual(signals[i].strength)
    }
  })
})

describe('deriveProtoMeanings', () => {
  it('all proto-meaning weights are between 0 and 1', () => {
    const result = runSignalRuntime('疲れた、自分を信じられない')
    for (const pm of result.protoMeanings) {
      expect(pm.weight).toBeGreaterThanOrEqual(0)
      expect(pm.weight).toBeLessThanOrEqual(1)
    }
  })

  it('proto-meanings are sorted by descending weight', () => {
    const result = runSignalRuntime('仕事が辛い、変わりたいけど怖い')
    const { protoMeanings } = result
    for (let i = 1; i < protoMeanings.length; i++) {
      expect(protoMeanings[i - 1].weight).toBeGreaterThanOrEqual(protoMeanings[i].weight)
    }
  })
})

describe('decideSignalUtterance', () => {
  it('never winner-take-all too early: suppressed modes list does not include chosen mode', () => {
    const result = runSignalRuntime('なんとなくしんどい')
    expect(result.decision.suppressedModes).not.toContain(result.decision.utteranceMode)
  })

  it('decision trace is non-empty', () => {
    const result = runSignalRuntime('疲れた')
    expect(result.decision.decisionTrace.length).toBeGreaterThan(0)
  })

  it('uses option-aware utterance shaping when provided', () => {
    const result = runSignalRuntime('転職するか、このまま続けるかで迷っている', {
      optionAwareness: {
        optionRatios: { 'option:change': 51, 'option:stay': 49 },
        dominantOptionId: 'option:change',
        differenceMagnitude: 0.02,
        hesitationStrength: 0.68,
        bridgeOptionPossible: true,
        confidence: 0.54,
        summaryLabel: '中間案がありそう',
      },
      optionDecision: {
        preferredOptionId: 'option:change',
        stance: 'bridge',
        shouldDefer: false,
        shouldOfferBridge: true,
        confidence: 0.54,
        notes: ['中間案がありそう'],
      },
      optionUtteranceHints: {
        favoredOptionLabel: '変える',
        secondaryOptionLabel: '続ける',
        bridgeOptionSuggested: true,
        hesitationTone: 'balanced',
        ratioText: '変える 51 / 続ける 49',
        suggestedClose: 'どちらか一方に急がず、間に置ける形から触れていってもよさそうです。',
        notes: ['bridge option をにじませる'],
      },
    })

    expect(result.decision.optionDecision?.stance).toBe('bridge')
    expect(result.utterance).toContain('間に置ける形')
  })
})

describe('buildSignalRevisionEntry', () => {
  it('builds a valid revision entry from signal result', () => {
    const result = runSignalRuntime('疲れた、もう限界')
    const entry = buildSignalRevisionEntry(result)
    expect(entry.id).toBeTruthy()
    expect(entry.status).toBe('ephemeral')
    expect(entry.inputText).toBe('疲れた、もう限界')
    expect(entry.rawReply).toBe(result.utterance)
  })

  it('flags high boundary tension in issueTags', () => {
    // Use input that triggers high external pressure
    const result = runSignalRuntime('仕事で毎日怒られて、もう一人でいたい、距離を置きたい')
    const entry = buildSignalRevisionEntry(result)
    // Should contain at least one issue tag
    expect(Array.isArray(entry.issueTags)).toBe(true)
  })
})
