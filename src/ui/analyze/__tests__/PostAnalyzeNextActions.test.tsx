import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { PostAnalyzeNextActions } from '../PostAnalyzeNextActions'
import type { PostAnalyzeNextActionsViewModel } from '../../viewModels/buildPostAnalyzeNextActionsViewModel'

const emptyViewModel: PostAnalyzeNextActionsViewModel = { actions: [] }

const fullViewModel: PostAnalyzeNextActionsViewModel = {
  actions: [
    { id: 'field', label: '発火タブ', tabId: 'field', description: '点群の反応を確認できます。', priority: 1 },
    { id: 'growth', label: '成長タブ', tabId: 'growth', description: 'assembly の変化を確認できます。', priority: 2 },
  ],
}

describe('PostAnalyzeNextActions', () => {
  it('renders nothing when no actions', () => {
    const html = renderToString(<PostAnalyzeNextActions viewModel={emptyViewModel} onTabChange={() => {}} />)
    expect(html).toBe('')
  })

  it('renders action list when actions exist', () => {
    const html = renderToString(<PostAnalyzeNextActions viewModel={fullViewModel} onTabChange={() => {}} />)
    expect(html).toContain('発火タブ')
    expect(html).toContain('成長タブ')
  })

  it('renders numbered items', () => {
    const html = renderToString(<PostAnalyzeNextActions viewModel={fullViewModel} onTabChange={() => {}} />)
    expect(html).toContain('1')
    expect(html).toContain('2')
  })
})
