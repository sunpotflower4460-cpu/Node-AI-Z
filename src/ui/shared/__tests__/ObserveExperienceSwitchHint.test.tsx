import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { ObserveExperienceSwitchHint } from '../ObserveExperienceSwitchHint'

describe('ObserveExperienceSwitchHint', () => {
  it('shows observe mode hint when currentMode is observe', () => {
    const html = renderToString(createElement(ObserveExperienceSwitchHint, { currentMode: 'observe' }))
    expect(html).toContain('裏側を見る場所')
    expect(html).toContain('体験モード')
  })

  it('shows experience mode hint when currentMode is experience', () => {
    const html = renderToString(createElement(ObserveExperienceSwitchHint, { currentMode: 'experience' }))
    expect(html).toContain('話す場所')
    expect(html).toContain('観察モード')
  })

  it('renders switch button when onSwitchClick provided', () => {
    const html = renderToString(
      createElement(ObserveExperienceSwitchHint, { currentMode: 'observe', onSwitchClick: () => {} })
    )
    expect(html).toContain('button')
  })

  it('renders collapsible details element when collapsible is true', () => {
    const html = renderToString(
      createElement(ObserveExperienceSwitchHint, { currentMode: 'observe', collapsible: true })
    )
    expect(html).toContain('details')
    expect(html).toContain('summary')
  })
})
