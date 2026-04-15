import { describe, expect, it } from 'vitest'
import { runNodePipeline } from '../../core/runNodePipeline'
import { createDefaultPlasticityState } from '../../revision/defaultPlasticityState'
import { buildStudioViewModel } from '../../studio/buildStudioViewModel'
import { buildSurfacePrompt, containsInternalLanguage } from '../buildSurfacePrompt'

describe('buildSurfacePrompt', () => {
  it('adds answer-the-question guidance for judgment support inputs', () => {
    const text = '転職したほうがいいのか、どうすべきかアドバイスがほしい'
    const result = runNodePipeline(text)
    const studioView = buildStudioViewModel(result)

    const prompt = buildSurfacePrompt({
      userInput: text,
      studioView,
      recentTurns: [],
      plasticity: createDefaultPlasticityState(),
    })

    expect(prompt.context.replyIntent).toBe('judgment_support')
    expect(prompt.system).toMatch(/answer the question/i)
    expect(prompt.user).toContain('Reply intent: judgment_support')
  })

  it('explicitly forbids leaking internal words in the surface reply', () => {
    const text = 'つらくて少し整理したい'
    const result = runNodePipeline(text)
    const studioView = buildStudioViewModel(result)

    const prompt = buildSurfacePrompt({
      userInput: text,
      studioView,
      recentTurns: [{ role: 'user', text: '昨日からしんどい' }],
      plasticity: createDefaultPlasticityState(),
    })

    expect(prompt.system).toContain('Never mention Node, Home, Revision, Memory, Pattern')
    expect(containsInternalLanguage('Node の内部状態です')).toBe(true)
    expect(containsInternalLanguage('自然に返答します')).toBe(false)
  })
})
