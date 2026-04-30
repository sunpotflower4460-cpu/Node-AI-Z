import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { TabEmptyState } from '../../shared/TabEmptyState'
import { GrowthTab } from '../GrowthTab'
import { RiskTab } from '../RiskTab'

describe('TabEmptyState', () => {
  it('renders title and description', () => {
    const html = renderToString(
      createElement(TabEmptyState, {
        title: 'まだ成長記録はありません',
        description: '繰り返し発火した点群が assembly として保存されると、ここに表示されます。',
      })
    )
    expect(html).toContain('まだ成長記録はありません')
    expect(html).toContain('繰り返し発火した点群')
  })

  it('renders nextAction when provided', () => {
    const html = renderToString(
      createElement(TabEmptyState, {
        title: 'タイトル',
        description: '説明',
        nextAction: '次のアクション',
      })
    )
    expect(html).toContain('次のアクション')
  })

  it('does not render nextAction when not provided', () => {
    const html = renderToString(
      createElement(TabEmptyState, { title: 'T', description: 'D' })
    )
    expect(html).not.toContain('rounded-full border border-indigo-200')
  })
})

describe('GrowthTab', () => {
  it('shows empty state when source is null', () => {
    const html = renderToString(
      createElement(GrowthTab, { source: null, detailMode: 'simple' })
    )
    expect(html).toContain('まだ成長記録はありません')
  })

  it('shows Japanese summary card label in simple mode', () => {
    const html = renderToString(
      createElement(GrowthTab, { source: null, detailMode: 'simple' })
    )
    expect(html).toContain('成長')
  })

  it('shows English summary card label in research mode', () => {
    const html = renderToString(
      createElement(GrowthTab, { source: null, detailMode: 'research' })
    )
    expect(html).toContain('Growth')
  })
})

describe('RiskTab', () => {
  it('renders section summary card', () => {
    const html = renderToString(
      createElement(RiskTab, { source: null, detailMode: 'simple' })
    )
    expect(html).toContain('リスク')
  })

  it('shows risk level in English in research mode', () => {
    const html = renderToString(
      createElement(RiskTab, { source: null, detailMode: 'research' })
    )
    expect(html).toContain('Risk')
  })
})
