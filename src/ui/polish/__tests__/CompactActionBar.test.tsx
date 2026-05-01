import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { CompactActionBar } from '../CompactActionBar'
import type { CompactAction } from '../CompactActionBar'

const noop = () => {}

const makeAction = (id: string, label: string, primary?: boolean): CompactAction => ({
  id,
  label,
  primary,
  onClick: noop,
})

describe('CompactActionBar', () => {
  it('renders action labels', () => {
    const html = renderToString(
      createElement(CompactActionBar, {
        actions: [makeAction('a', 'Analyze', true)],
      })
    )
    expect(html).toContain('Analyze')
  })

  it('limits to 3 actions', () => {
    const actions = [
      makeAction('a', 'Action1'),
      makeAction('b', 'Action2'),
      makeAction('c', 'Action3'),
      makeAction('d', 'Action4'),
    ]
    const html = renderToString(createElement(CompactActionBar, { actions }))
    expect(html).toContain('Action1')
    expect(html).toContain('Action2')
    expect(html).toContain('Action3')
    expect(html).not.toContain('Action4')
  })

  it('renders primary action with distinct styling', () => {
    const html = renderToString(
      createElement(CompactActionBar, {
        actions: [makeAction('analyze', 'Analyze', true)],
      })
    )
    expect(html).toContain('bg-cyan-500')
  })

  it('renders toolbar role', () => {
    const html = renderToString(
      createElement(CompactActionBar, { actions: [makeAction('a', 'Test')] })
    )
    expect(html).toContain('role="toolbar"')
  })
})
