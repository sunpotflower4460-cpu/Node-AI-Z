import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createPersonalLearningState } from '../../learning/personalLearning'
import { runLayeredThinkingRuntime } from '../../runtime/runLayeredThinkingRuntime'
import { LayeredObservePanel } from '../LayeredObservePanel'

describe('LayeredObservePanel render', () => {
  it('renders the layered observe summary and details sections', async () => {
    const result = await runLayeredThinkingRuntime({
      text: '元気ですか',
      personalLearning: createPersonalLearningState(),
    })

    const html = renderToString(
      createElement(LayeredObservePanel, {
        result,
      })
    )

    expect(html).toContain('Turn 1')
    expect(html).toContain('Input:')
    expect(html).toContain('【意味】')
    expect(html).toContain('【発話】')
    expect(html).toContain('▶ 詳細を見る')
    expect(html).toContain('templateKey:')
  })
})
