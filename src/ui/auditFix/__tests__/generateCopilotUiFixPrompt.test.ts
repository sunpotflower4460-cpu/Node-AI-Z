import { describe, expect, it } from 'vitest'
import { generateCopilotUiFixPrompt } from '../generateCopilotUiFixPrompt'
import type { UiFixCandidate } from '../uiAuditFixTypes'

const makeCandidate = (overrides: Partial<UiFixCandidate> = {}): UiFixCandidate => ({
  id: 'test-id',
  sourceScreenId: 'home',
  sourceCheckId: 'check-1',
  category: 'first_screen',
  title: 'Test title',
  problem: 'Test problem',
  recommendedFix: 'Test fix',
  priority: 'p0',
  impact: 'high',
  effort: 'small',
  affectedFilesHint: ['src/ui/overview/EmptyObservationState.tsx'],
  acceptanceCriteria: ['EmptyState is shown before Analyze'],
  ...overrides,
})

const stubGroup = {
  id: 'pr-home',
  title: 'Home / 初期画面の整理',
  summary: 'First screen improvements',
  branchName: 'fix/ui-home-first-screen',
  categories: ['first_screen' as const],
}

describe('generateCopilotUiFixPrompt', () => {
  it('includes Task section', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('# Task')
  })

  it('includes Do Not section', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('# Do Not')
  })

  it('includes acceptance criteria section', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('# Acceptance Criteria')
  })

  it('includes the candidate title in issues section', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('Test title')
  })

  it('includes affected files', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('EmptyObservationState.tsx')
  })

  it('includes Final Report Format section', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('# Final Report Format')
  })

  it('includes branch name', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('fix/ui-home-first-screen')
  })

  it('includes Do section from base template', () => {
    const prompt = generateCopilotUiFixPrompt(stubGroup, [makeCandidate()])
    expect(prompt).toContain('# Do')
  })
})
