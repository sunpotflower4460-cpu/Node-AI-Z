import { describe, expect, it } from 'vitest'
import { groupFixesIntoPrPlans } from '../groupFixesIntoPrPlans'
import type { UiFixCandidate } from '../uiAuditFixTypes'

const makeCandidate = (overrides: Partial<UiFixCandidate>): UiFixCandidate => ({
  id: 'test-id',
  sourceScreenId: 'home',
  sourceCheckId: 'check-1',
  category: 'first_screen',
  title: 'Test',
  problem: 'Test problem',
  recommendedFix: 'Test fix',
  priority: 'p1',
  impact: 'medium',
  effort: 'small',
  affectedFilesHint: [],
  acceptanceCriteria: [],
  ...overrides,
})

const stubPrompt = () => 'stub-prompt'

describe('groupFixesIntoPrPlans', () => {
  it('groups first_screen candidates into a PR plan', () => {
    const candidates = [makeCandidate({ id: '1', category: 'first_screen' })]
    const plans = groupFixesIntoPrPlans(candidates, stubPrompt)
    const homePlan = plans.find((p) => p.id === 'pr-home')
    expect(homePlan).toBeDefined()
    expect(homePlan!.candidates.length).toBe(1)
  })

  it('groups analyze_flow candidates into a PR plan', () => {
    const candidates = [makeCandidate({ id: '1', category: 'analyze_flow' })]
    const plans = groupFixesIntoPrPlans(candidates, stubPrompt)
    const analyzePlan = plans.find((p) => p.id === 'pr-analyze')
    expect(analyzePlan).toBeDefined()
  })

  it('omits PR plans with no candidates', () => {
    const candidates = [makeCandidate({ id: '1', category: 'first_screen' })]
    const plans = groupFixesIntoPrPlans(candidates, stubPrompt)
    const analyzePlan = plans.find((p) => p.id === 'pr-analyze')
    expect(analyzePlan).toBeUndefined()
  })

  it('calls generatePrompt for each plan', () => {
    const candidates = [
      makeCandidate({ id: '1', category: 'first_screen' }),
      makeCandidate({ id: '2', category: 'tab_structure' }),
    ]
    const calls: unknown[] = []
    const trackingPrompt = (group: unknown, groupCandidates: unknown) => {
      calls.push({ group, groupCandidates })
      return 'stub'
    }
    groupFixesIntoPrPlans(candidates, trackingPrompt)
    expect(calls.length).toBe(2)
  })

  it('sorts plans by priority (p0 first)', () => {
    const candidates = [
      makeCandidate({ id: '1', category: 'first_screen', priority: 'p0' }),
      makeCandidate({ id: '2', category: 'tab_structure', priority: 'p1' }),
    ]
    const plans = groupFixesIntoPrPlans(candidates, stubPrompt)
    expect(plans[0].priority).toBe('p0')
  })

  it('sets suggestedBranchName on each plan', () => {
    const candidates = [makeCandidate({ id: '1', category: 'first_screen' })]
    const plans = groupFixesIntoPrPlans(candidates, stubPrompt)
    expect(plans[0].suggestedBranchName).toMatch(/^fix\//)
  })

  it('assigns copilotPrompt from generatePrompt', () => {
    const candidates = [makeCandidate({ id: '1', category: 'first_screen' })]
    const plans = groupFixesIntoPrPlans(candidates, () => 'my-prompt')
    expect(plans[0].copilotPrompt).toBe('my-prompt')
  })
})
