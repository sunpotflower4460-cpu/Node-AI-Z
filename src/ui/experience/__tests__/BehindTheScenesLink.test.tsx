import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { BehindTheScenesLink } from '../BehindTheScenesLink'
import type { RecommendedObserveLink } from '../buildExperienceResultViewModel'

const links: RecommendedObserveLink[] = [
  { label: '発火を見る', targetMode: 'observe', targetTab: 'field', reason: 'Signal が記録されました' },
  { label: '成長を見る', targetMode: 'observe', targetTab: 'growth', reason: 'assembly が更新されました' },
]

describe('BehindTheScenesLink', () => {
  it('renders 裏側を見る heading', () => {
    const html = renderToString(
      <BehindTheScenesLink internalSummary="観察が更新されました" links={links} onNavigate={() => {}} />
    )
    expect(html).toContain('裏側を見る')
  })

  it('renders internalSummary text', () => {
    const html = renderToString(
      <BehindTheScenesLink internalSummary="New Signal Mode の観察も更新されました。" links={links} onNavigate={() => {}} />
    )
    expect(html).toContain('New Signal Mode の観察も更新されました。')
  })

  it('renders all link buttons', () => {
    const html = renderToString(
      <BehindTheScenesLink internalSummary="テスト" links={links} onNavigate={() => {}} />
    )
    expect(html).toContain('発火を見る')
    expect(html).toContain('成長を見る')
  })
})
