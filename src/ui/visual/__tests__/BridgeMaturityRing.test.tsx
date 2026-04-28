import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { BridgeMaturityRing } from '../BridgeMaturityRing'

describe('BridgeMaturityRing', () => {
  it('renders SVG with dependency and recall values', () => {
    const html = renderToString(
      createElement(BridgeMaturityRing, {
        teacherDependency: 0.28,
        recallSuccess: 0.74,
      })
    )
    expect(html).toContain('svg')
    expect(html).toContain('28%')
    expect(html).toContain('74%')
  })

  it('renders with 0 values without error', () => {
    expect(() =>
      renderToString(
        createElement(BridgeMaturityRing, { teacherDependency: 0, recallSuccess: 0 })
      )
    ).not.toThrow()
  })
})
