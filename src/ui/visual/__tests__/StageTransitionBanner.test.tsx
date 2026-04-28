import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { StageTransitionBanner } from '../StageTransitionBanner'

describe('StageTransitionBanner', () => {
  it('renders stage transition info', () => {
    const html = renderToString(
      createElement(StageTransitionBanner, {
        fromStage: 4,
        toStage: 5,
        unlockedFeature: 'Contrast Learning',
      })
    )
    expect(html).toContain('Stage Up')
    expect(html).toContain('Stage 4')
    expect(html).toContain('Stage 5')
    expect(html).toContain('Contrast Learning')
  })

  it('renders without unlockedFeature', () => {
    const html = renderToString(
      createElement(StageTransitionBanner, {
        fromStage: 1,
        toStage: 2,
      })
    )
    expect(html).toContain('Stage 1')
    expect(html).toContain('Stage 2')
  })
})
