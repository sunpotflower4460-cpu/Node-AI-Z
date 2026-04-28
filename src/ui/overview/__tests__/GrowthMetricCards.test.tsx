import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { GrowthMetricCards } from '../GrowthMetricCards'

describe('GrowthMetricCards', () => {
  it('renders growth metrics and raw values in research mode', () => {
    const html = renderToString(
      <GrowthMetricCards
        detailMode="research"
        growth={{
          assemblyCount: 4,
          bridgeCount: 3,
          protoSeedCount: 2,
          teacherFreeBridgeCount: 1,
          recallSuccessRate: 0.67,
          averageTeacherDependency: 0.33,
          promotionReadyCandidates: 2,
        }}
      />,
    )

    expect(html).toContain('Assemblies')
    expect(html).toContain('Teacher-Free Bridges')
    expect(html).toContain('raw: 0.67')
  })
})
