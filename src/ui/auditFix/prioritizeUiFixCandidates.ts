import type { UiFixCandidate } from './uiAuditFixTypes'

type PriorityRule = {
  test: (c: UiFixCandidate) => boolean
  priority: 'p0' | 'p1' | 'p2'
  effort: UiFixCandidate['effort']
}

const PRIORITY_RULES: PriorityRule[] = [
  // p0: immediate pain points
  {
    test: (c) => c.category === 'first_screen' && c.impact === 'high',
    priority: 'p0',
    effort: 'small',
  },
  {
    test: (c) => c.category === 'analyze_flow' && c.impact === 'high',
    priority: 'p0',
    effort: 'small',
  },
  {
    test: (c) => c.category === 'mobile_readability' && c.impact === 'high',
    priority: 'p0',
    effort: 'medium',
  },
  {
    test: (c) => c.category === 'settings_clarity' && c.sourceScreenId === 'settings' && c.impact === 'high',
    priority: 'p0',
    effort: 'small',
  },
  // p1: next to fix
  {
    test: (c) => c.category === 'empty_state',
    priority: 'p1',
    effort: 'small',
  },
  {
    test: (c) => c.category === 'tab_structure',
    priority: 'p1',
    effort: 'medium',
  },
  {
    test: (c) => c.category === 'research_overexposure',
    priority: 'p1',
    effort: 'small',
  },
  {
    test: (c) => c.category === 'copy_clarity',
    priority: 'p1',
    effort: 'small',
  },
  {
    test: (c) => c.category === 'risk_wording',
    priority: 'p1',
    effort: 'small',
  },
  {
    test: (c) => c.category === 'mother_wording',
    priority: 'p1',
    effort: 'small',
  },
  // p2: nice to have
  {
    test: (c) => c.impact === 'low',
    priority: 'p2',
    effort: 'small',
  },
]

export const prioritizeUiFixCandidates = (candidates: UiFixCandidate[]): UiFixCandidate[] => {
  return candidates.map((candidate) => {
    for (const rule of PRIORITY_RULES) {
      if (rule.test(candidate)) {
        return { ...candidate, priority: rule.priority, effort: rule.effort }
      }
    }
    return candidate
  })
}
