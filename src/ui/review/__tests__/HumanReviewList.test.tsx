import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { HumanReviewList } from '../HumanReviewList'
import type { HumanReviewEntry } from '../../../core'

const buildEntry = (overrides: Partial<HumanReviewEntry> = {}): HumanReviewEntry => ({
  summary: {
    candidateId: 'cand-1',
    candidateKind: 'schema',
    confidenceScore: 0.8,
    riskLevel: 'medium',
    crossBranchSupportCount: 1,
    comparedBranchCount: 2,
    consistencyScore: 0.55,
    summary: ['Kind: schema', 'Risk: medium'],
    cautionNotes: ['watch rollout'],
    consistencyNotes: ['support comes from one other branch only'],
    sourceBranchId: 'branch-1',
    createdAt: 1,
  },
  guardianMode: 'human_required',
  promotionStatus: 'quarantined',
  reviewStatus: 'pending',
  ...overrides,
})

describe('HumanReviewList', () => {
  it('renders human review entries with status and risk badge', () => {
    const html = renderToString(
      <HumanReviewList
        items={[buildEntry()]}
        selectedId="cand-1"
        onSelect={() => {}}
      />
    )

    expect(html).toContain('schema')
    expect(html).toContain('medium')
    expect(html).toContain('pending')
  })

  it('renders empty state when no items', () => {
    const html = renderToString(
      <HumanReviewList
        items={[]}
        selectedId={undefined}
        onSelect={() => {}}
      />
    )

    expect(html).toContain('No review candidates')
  })
})
