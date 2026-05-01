import { describe, expect, it } from 'vitest'
import { prioritizeUiFixCandidates } from '../prioritizeUiFixCandidates'
import type { UiFixCandidate } from '../uiAuditFixTypes'

const makeCandidate = (overrides: Partial<UiFixCandidate>): UiFixCandidate => ({
  id: 'test-id',
  sourceScreenId: 'home',
  sourceCheckId: 'check-1',
  category: 'first_screen',
  title: 'Test',
  problem: 'Test problem',
  recommendedFix: 'Test fix',
  priority: 'p2',
  impact: 'high',
  effort: 'medium',
  affectedFilesHint: [],
  acceptanceCriteria: [],
  ...overrides,
})

describe('prioritizeUiFixCandidates', () => {
  it('assigns p0 to high-impact first_screen candidates', () => {
    const input = [makeCandidate({ category: 'first_screen', impact: 'high' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p0')
  })

  it('assigns p0 to high-impact analyze_flow candidates', () => {
    const input = [makeCandidate({ category: 'analyze_flow', impact: 'high' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p0')
  })

  it('assigns p0 to high-impact mobile_readability candidates', () => {
    const input = [makeCandidate({ category: 'mobile_readability', impact: 'high' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p0')
  })

  it('assigns p1 to empty_state candidates', () => {
    const input = [makeCandidate({ category: 'empty_state', impact: 'medium' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p1')
  })

  it('assigns p1 to tab_structure candidates', () => {
    const input = [makeCandidate({ category: 'tab_structure', impact: 'medium' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p1')
  })

  it('assigns p1 to copy_clarity candidates', () => {
    const input = [makeCandidate({ category: 'copy_clarity', impact: 'medium' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p1')
  })

  it('assigns p2 to low-impact candidates that match no higher-priority rule', () => {
    const input = [makeCandidate({ category: 'first_screen', impact: 'low' })]
    const result = prioritizeUiFixCandidates(input)
    expect(result[0].priority).toBe('p2')
  })

  it('does not mutate the original candidates', () => {
    const input = [makeCandidate({ priority: 'p2' })]
    prioritizeUiFixCandidates(input)
    expect(input[0].priority).toBe('p2')
  })

  it('returns the same count of candidates', () => {
    const input = [
      makeCandidate({ id: '1', category: 'first_screen', impact: 'high' }),
      makeCandidate({ id: '2', category: 'empty_state', impact: 'medium' }),
      makeCandidate({ id: '3', category: 'copy_clarity', impact: 'low' }),
    ]
    const result = prioritizeUiFixCandidates(input)
    expect(result.length).toBe(3)
  })
})
