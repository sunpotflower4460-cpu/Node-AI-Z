import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { BridgeMaturityBadge } from '../BridgeMaturityBadge'

describe('BridgeMaturityBadge', () => {
  it('renders tentative stage', () => {
    const html = renderToString(createElement(BridgeMaturityBadge, { stage: 'tentative' }))
    expect(html).toContain('Tentative')
  })

  it('renders teacher_free stage', () => {
    const html = renderToString(createElement(BridgeMaturityBadge, { stage: 'teacher_free' }))
    expect(html).toContain('Teacher Free')
  })

  it('renders promoted stage', () => {
    const html = renderToString(createElement(BridgeMaturityBadge, { stage: 'promoted' }))
    expect(html).toContain('Promoted')
  })

  it('renders all valid stages without error', () => {
    const stages = ['tentative', 'reinforced', 'teacher_light', 'teacher_free', 'promoted'] as const
    for (const stage of stages) {
      expect(() => renderToString(createElement(BridgeMaturityBadge, { stage }))).not.toThrow()
    }
  })
})
