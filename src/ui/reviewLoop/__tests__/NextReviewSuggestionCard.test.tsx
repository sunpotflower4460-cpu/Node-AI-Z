import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { NextReviewSuggestionCard } from '../NextReviewSuggestionCard'
import type { NextUiReviewSuggestion } from '../uiReviewLoopTypes'

const makeSuggestion = (overrides: Partial<NextUiReviewSuggestion> = {}): NextUiReviewSuggestion => ({
  priority: 'p1',
  title: 'Settings Clarity の再整理',
  reason: 'Research設定がSimple Viewに少し出すぎています',
  recommendedScope: 'SettingsPanel / ResearchSettingsSection',
  suggestedNextPrompt: 'SettingsPanelのResearch設定を整理してください',
  ...overrides,
})

describe('NextReviewSuggestionCard', () => {
  it('renders without error', () => {
    const html = renderToString(createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion() }))
    expect(html.length).toBeGreaterThan(0)
  })

  it('shows title', () => {
    const html = renderToString(createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion() }))
    expect(html).toContain('Settings Clarity の再整理')
  })

  it('shows reason', () => {
    const html = renderToString(createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion() }))
    expect(html).toContain('Research設定がSimple Viewに少し出すぎています')
  })

  it('shows priority badge', () => {
    const html = renderToString(createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion() }))
    expect(html).toContain('P1')
  })

  it('shows recommended scope', () => {
    const html = renderToString(createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion() }))
    expect(html).toContain('SettingsPanel / ResearchSettingsSection')
  })

  it('shows suggested prompt when provided', () => {
    const html = renderToString(createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion() }))
    expect(html).toContain('SettingsPanelのResearch設定を整理してください')
  })

  it('does not show prompt section when not provided', () => {
    const html = renderToString(
      createElement(NextReviewSuggestionCard, {
        suggestion: makeSuggestion({ suggestedNextPrompt: undefined }),
      }),
    )
    expect(html).not.toContain('提案プロンプト')
  })

  it('shows p0 priority for critical issues', () => {
    const html = renderToString(
      createElement(NextReviewSuggestionCard, { suggestion: makeSuggestion({ priority: 'p0' }) }),
    )
    expect(html).toContain('P0')
  })
})
