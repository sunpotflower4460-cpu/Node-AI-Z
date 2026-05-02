import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { UiReviewDeltaPanel } from '../UiReviewDeltaPanel'
import type { UiReviewDelta } from '../uiReviewLoopTypes'

const makeDelta = (overrides: Partial<UiReviewDelta> = {}): UiReviewDelta => ({
  scoreBefore: 72,
  scoreAfter: 84,
  scoreDelta: 12,
  scoreDeltaLabel: '+12 improved',
  resolvedWarnings: ['Home / 概要: 0件カードが多い'],
  remainingWarnings: ['Settings: Research設定が出すぎ'],
  newWarnings: [],
  screenScoreDeltas: [
    { screenId: 'home', screenLabel: 'Home / 概要', beforeScore: 75, afterScore: 90, delta: 15 },
  ],
  summary: 'Score: 72 → 84 (+12 improved)',
  ...overrides,
})

describe('UiReviewDeltaPanel', () => {
  it('renders without error', () => {
    const html = renderToString(createElement(UiReviewDeltaPanel, { delta: makeDelta() }))
    expect(html.length).toBeGreaterThan(0)
  })

  it('shows score delta label', () => {
    const html = renderToString(createElement(UiReviewDeltaPanel, { delta: makeDelta() }))
    expect(html).toContain('72')
    expect(html).toContain('84')
    expect(html).toContain('+12 improved')
  })

  it('shows resolved warnings', () => {
    const html = renderToString(createElement(UiReviewDeltaPanel, { delta: makeDelta() }))
    expect(html).toContain('改善済み')
    expect(html).toContain('0件カードが多い')
  })

  it('shows remaining warnings', () => {
    const html = renderToString(createElement(UiReviewDeltaPanel, { delta: makeDelta() }))
    expect(html).toContain('まだ残る課題')
    expect(html).toContain('Research設定が出すぎ')
  })

  it('shows screen score deltas', () => {
    const html = renderToString(createElement(UiReviewDeltaPanel, { delta: makeDelta() }))
    expect(html).toContain('Home / 概要')
    expect(html).toContain('+15')
  })

  it('does not show new warnings section when empty', () => {
    const html = renderToString(createElement(UiReviewDeltaPanel, { delta: makeDelta({ newWarnings: [] }) }))
    expect(html).not.toContain('新しい警告')
  })
})
