import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiFixPlanPanel } from '../UiFixPlanPanel'

describe('UiFixPlanPanel', () => {
  it('renders without error', () => {
    const html = renderToString(createElement(UiFixPlanPanel))
    expect(html).toContain('UI Fix Plan')
  })

  it('shows audit score', () => {
    const html = renderToString(createElement(UiFixPlanPanel))
    expect(html).toContain('Audit Score:')
  })

  it('shows priority label', () => {
    const html = renderToString(createElement(UiFixPlanPanel))
    expect(html).toContain('Priority:')
  })

  it('shows PR plans section', () => {
    const html = renderToString(createElement(UiFixPlanPanel))
    expect(html).toContain('推奨 PR 一覧')
  })
})
