import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { RiskSummaryCard } from '../RiskSummaryCard'

describe('RiskSummaryCard', () => {
  it('renders all risk levels and warnings', () => {
    const html = renderToString(
      <RiskSummaryCard
        detailMode="research"
        risk={{
          level: 'high',
          summary: 'Risk: High — teacher 由来の bridge が強くなりすぎています。',
          overbindingRisk: 0.2,
          teacherOvertrustRisk: 0.8,
          falseBindingRisk: 0.5,
          dreamNoiseRisk: 0.1,
          warnings: ['High teacher overtrust risk (0.80)'],
        }}
      />,
    )

    expect(html).toContain('Risk Summary')
    expect(html).toContain('teacher 由来の bridge が強くなりすぎています。')
    expect(html).toContain('High teacher overtrust risk (0.80)')
    expect(html).toContain('0.80')
  })
})
