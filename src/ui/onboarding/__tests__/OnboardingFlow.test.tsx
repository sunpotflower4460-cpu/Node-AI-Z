import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { OnboardingFlow } from '../OnboardingFlow'

describe('OnboardingFlow', () => {
  it('renders first step content', () => {
    const html = renderToString(
      createElement(OnboardingFlow, { onComplete: () => {} })
    )
    expect(html).toContain('1 / 5')
    expect(html).toContain('Node-AI-Z')
  })

  it('renders navigation buttons', () => {
    const html = renderToString(
      createElement(OnboardingFlow, { onComplete: () => {} })
    )
    expect(html).toContain('次へ')
    expect(html).toContain('スキップ')
  })
})
