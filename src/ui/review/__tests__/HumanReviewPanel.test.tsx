import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { HumanReviewPanel } from '../HumanReviewPanel'
import type { HumanReviewEntry } from '../../../core'

const makeEntry = (id: string, status: HumanReviewEntry['reviewStatus']): HumanReviewEntry => ({
  summary: {
    candidateId: id,
    candidateKind: 'schema',
    confidenceScore: 0.8,
    riskLevel: 'medium',
    summary: ['Kind: schema'],
    cautionNotes: [],
    sourceBranchId: 'branch-1',
    createdAt: 1,
  },
  guardianMode: 'human_required',
  promotionStatus: status === 'pending' ? 'quarantined' : 'approved',
  reviewStatus: status,
  record: status === 'resolved' ? {
    id: 'record-1',
    candidateId: id,
    actor: 'human_reviewer',
    decision: 'approve',
    reason: 'ok',
    createdAt: 1,
  } : undefined,
})

describe('HumanReviewPanel', () => {
  it('renders pending and resolved counts when items exist', () => {
    const html = renderToString(
      <HumanReviewPanel
        pending={[makeEntry('cand-1', 'pending')]}
        resolved={[makeEntry('cand-2', 'resolved')]}
        onDecision={() => {}}
      />
    )

    expect(html).toContain('Human Review Panel')
    expect(html).toContain('Pending (1)')
    expect(html).toContain('Resolved (1)')
  })

  it('renders nothing when no review items', () => {
    const html = renderToString(
      <HumanReviewPanel
        pending={[]}
        resolved={[]}
        onDecision={() => {}}
      />
    )

    expect(html).toBe('')
  })
})
