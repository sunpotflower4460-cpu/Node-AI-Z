import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DevelopmentStageCard } from '../DevelopmentStageCard'

describe('DevelopmentStageCard', () => {
  it('renders the current stage, next stage, and requirements', () => {
    const html = renderToString(
      <DevelopmentStageCard
        researchMode
        development={{
          currentStage: 'Stage 4 — Self Recall',
          stageSummary: 'teacher なしで一部の bridge を想起し始めています。',
          nextStage: 'Stage 5 — Contrast Learning',
          progress: 0.75,
          requirements: [
            {
              label: 'teacher-free bridge count >= 3',
              currentValue: 2,
              requiredValue: 3,
              satisfied: false,
              notes: ['contrast record count を増やすと改善しやすい'],
            },
          ],
          bottlenecks: ['contrast record count が不足'],
          recommendedNextActions: ['似ているけど違う刺激を試す'],
        }}
      />,
    )

    expect(html).toContain('Stage 4 — Self Recall')
    expect(html).toContain('Stage 5 — Contrast Learning')
    expect(html).toContain('teacher-free bridge count &gt;= 3')
    expect(html).toContain('contrast record count が不足')
  })
})
