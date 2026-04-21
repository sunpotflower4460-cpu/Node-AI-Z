import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { TrunkUndoPanel } from '../TrunkUndoPanel'

describe('TrunkUndoPanel render', () => {
  it('renders trunk apply and revert history', () => {
    const html = renderToString(
      createElement(TrunkUndoPanel, {
        applyRecords: [
          {
            id: 'apply-1',
            candidateId: 'candidate-1',
            promotionKind: 'schema',
            appliedAt: 1,
            trunkDiffSummary: ['schemaPatterns +1: calm-bridge'],
            appliedBy: 'system',
          },
        ],
        revertRecords: [
          {
            id: 'revert-1',
            targetApplyRecordId: 'apply-1',
            revertedAt: 2,
            reason: 'undo',
            trunkDiffSummary: ['schema revert calm-bridge'],
            revertedBy: 'human_reviewer',
          },
        ],
        currentSafetySnapshotId: 'snapshot-1',
        consistencyResult: {
          ok: true,
          notes: ['safe'],
          warningKeys: [],
        },
        onUndo: () => {},
      })
    )

    expect(html).toContain('Trunk Safe Undo')
    expect(html).toContain('candidate-1')
    expect(html).toContain('Undo / Revert')
    expect(html).toContain('Current Revert Safety Snapshot')
  })
})
