import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DevelopmentRequirementList } from '../DevelopmentRequirementList'

describe('DevelopmentRequirementList', () => {
  it('renders requirement rows and notes', () => {
    const html = renderToString(
      <DevelopmentRequirementList
        researchMode
        requirements={[
          {
            label: 'recall success >= 0.6',
            currentValue: 0.55,
            requiredValue: 0.6,
            satisfied: false,
            notes: ['teacher-free recall を増やす'],
          },
        ]}
      />,
    )

    expect(html).toContain('recall success &gt;= 0.6')
    expect(html).toContain('0.55 / 0.60')
    expect(html).toContain('teacher-free recall を増やす')
  })
})
