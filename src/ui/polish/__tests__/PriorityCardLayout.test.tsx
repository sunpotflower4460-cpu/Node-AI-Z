import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { PriorityCardLayout } from '../PriorityCardLayout'

describe('PriorityCardLayout', () => {
  it('renders hero slot', () => {
    const html = renderToString(
      createElement(PriorityCardLayout, {
        heroSlot: createElement('div', null, 'HeroContent'),
      })
    )
    expect(html).toContain('HeroContent')
  })

  it('renders main slot', () => {
    const html = renderToString(
      createElement(PriorityCardLayout, {
        mainSlot: createElement('div', null, 'MainContent'),
      })
    )
    expect(html).toContain('MainContent')
  })

  it('hides research slot when showResearch is false', () => {
    const html = renderToString(
      createElement(PriorityCardLayout, {
        researchSlot: createElement('div', null, 'ResearchContent'),
        showResearch: false,
      })
    )
    expect(html).not.toContain('ResearchContent')
  })

  it('shows research slot when showResearch is true', () => {
    const html = renderToString(
      createElement(PriorityCardLayout, {
        researchSlot: createElement('div', null, 'ResearchContent'),
        showResearch: true,
      })
    )
    expect(html).toContain('ResearchContent')
  })
})
