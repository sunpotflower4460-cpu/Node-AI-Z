import { describe, expect, it } from 'vitest'
import { createInitialBrainState } from '../../brainState'
import type { L4Result } from '../../L4/types'
import type { L5Result } from '../../L5/types'
import type { L6Result } from '../../L6/types'
import { runL7 } from '../utteranceRenderer'

/**
 * Creates a renderer input set with sensible defaults.
 *
 * @param overrides - Partial overrides for the layered inputs.
 * @returns Fixed L4-L6 inputs and brain state.
 */
function createRendererInput(overrides?: {
  l4Result?: Partial<L4Result['frame']>
  l5Result?: Partial<L5Result['reaction']>
  l6Result?: Partial<L6Result['decision']>
}) {
  return {
    brainState: createInitialBrainState(),
    l4Result: {
      frame: {
        gist: '挨拶として元気かを聞いている',
        need: 'connection',
        contextModifier: null,
        relation: 'new_topic',
        ...overrides?.l4Result,
      },
    } satisfies L4Result,
    l5Result: {
      reaction: {
        wantToRespond: true,
        feelsSafe: true,
        feelsRelevant: true,
        feelsUrgent: false,
        warmth: 0.6,
        reactedTo: ['挨拶されている'],
        snag: null,
        ...overrides?.l5Result,
      },
    } satisfies L5Result,
    l6Result: {
      decision: {
        action: 'greet_back',
        topic: '元気',
        length: 'short',
        confidence: 0.8,
        showUncertainty: false,
        askBack: true,
        reasoning: '挨拶として返す',
        warmthBand: 'warm',
        ...overrides?.l6Result,
      },
    } satisfies L6Result,
  }
}

describe('runL7', () => {
  it('renders a warm greeting reply with ask-back', () => {
    const input = createRendererInput()
    const result = runL7(input.l4Result, input.l5Result, input.l6Result, input.brainState)

    expect(result.templateKey).toBe('greet_back_warm')
    expect(result.utterance).toContain('元気')
    expect(result.utterance).toContain('そっちはどう？')
    expect(result.appliedModifiers).toContain('ask_back_suffix')
  })

  it('adds an uncertainty prefix when confidence is low', () => {
    const input = createRendererInput({
      l4Result: {
        gist: '何を言おうとしているかまだ曖昧',
        need: 'unclear',
      },
      l5Result: {
        reactedTo: ['意図がまだ曖昧'],
      },
      l6Result: {
        action: 'ask_back',
        topic: '',
        showUncertainty: true,
        askBack: true,
        warmthBand: 'neutral',
      },
    })
    const result = runL7(input.l4Result, input.l5Result, input.l6Result, input.brainState)

    expect(result.templateKey).toBe('ask_back_short')
    expect(result.utterance.startsWith('たぶん、')).toBe(true)
    expect(result.appliedModifiers).toContain('uncertainty_prefix')
    expect(result.appliedModifiers).toContain('ask_back_suffix')
  })

  it('uses reaction-aware listening phrasing', () => {
    const input = createRendererInput({
      l4Result: {
        gist: 'モヤモヤという気持ちを出している',
        need: 'expression',
      },
      l5Result: {
        reactedTo: ['気持ちを打ち明けられている'],
      },
      l6Result: {
        action: 'listen',
        topic: 'モヤモヤ',
        askBack: true,
        warmthBand: 'neutral',
      },
    })
    const result = runL7(input.l4Result, input.l5Result, input.l6Result, input.brainState)

    expect(result.templateKey).toBe('listen_short')
    expect(result.utterance).toContain('気持ちを打ち明けられている')
    expect(result.utterance).toContain('もう少し聞かせて。')
  })
})
