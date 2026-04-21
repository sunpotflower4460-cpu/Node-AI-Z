import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { HumanReviewDetail } from '../HumanReviewDetail'
import type { HumanReviewEntry } from '../../../core'

const entry: HumanReviewEntry = {
  summary: {
    candidateId: 'cand-2',
    candidateKind: 'mixed_node',
    confidenceScore: 0.76,
    riskLevel: 'high',
    summary: ['Kind: mixed_node', 'Risk: high', 'Would promote mixed node'],
    cautionNotes: ['High risk candidate'],
    sourceBranchId: 'branch-1',
    createdAt: 2,
  },
  guardianMode: 'human_required',
  promotionStatus: 'quarantined',
  reviewStatus: 'pending',
}

describe('HumanReviewDetail', () => {
  it('renders summary and caution notes', () => {
    const html = renderToString(<HumanReviewDetail entry={entry} />)

    expect(html).toContain('Candidate Detail')
    expect(html).toContain('mixed_node')
    expect(html).toContain('High risk candidate')
  })

  it('renders placeholder when no entry is selected', () => {
    const html = renderToString(<HumanReviewDetail entry={null} />)
    expect(html).toContain('Select a candidate')
  })
})
