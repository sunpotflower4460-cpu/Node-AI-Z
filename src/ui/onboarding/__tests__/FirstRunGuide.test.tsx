import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { FirstRunGuide } from '../FirstRunGuide'

describe('FirstRunGuide', () => {
  it('renders without error in SSR context (localStorage unavailable)', () => {
    // In node environment, localStorage is not available, so showOnboarding stays false
    const html = renderToString(createElement(FirstRunGuide, null))
    // Since no localStorage in node env, it renders null (no onboarding shown)
    expect(html).toBe('')
  })
})
