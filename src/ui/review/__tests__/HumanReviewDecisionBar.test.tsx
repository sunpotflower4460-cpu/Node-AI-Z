import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { HumanReviewDecisionBar } from '../HumanReviewDecisionBar'

describe('HumanReviewDecisionBar', () => {
  it('shows decision controls and reason input', () => {
    const html = renderToString(
      <HumanReviewDecisionBar
        candidateId="cand-3"
        onSubmit={() => {}}
      />
    )

    expect(html).toContain('Decision')
    expect(html).toContain('Reason')
    expect(html).toContain('Approve')
    expect(html).toContain('Reject')
  })
})
