import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AnalyzeErrorState } from '../AnalyzeErrorState'

describe('AnalyzeErrorState', () => {
  it('renders error title', () => {
    const html = renderToString(<AnalyzeErrorState />)
    expect(html).toContain('Analyze に失敗しました')
  })

  it('renders retry button when onRetry is provided', () => {
    const html = renderToString(<AnalyzeErrorState onRetry={() => {}} />)
    expect(html).toContain('もう一度試す')
  })

  it('shows error message in research mode', () => {
    const html = renderToString(
      <AnalyzeErrorState errorMessage="pipeline failed at step 3" researchMode={true} />
    )
    expect(html).toContain('pipeline failed at step 3')
  })

  it('hides error message in simple mode', () => {
    const html = renderToString(
      <AnalyzeErrorState errorMessage="pipeline failed at step 3" researchMode={false} />
    )
    expect(html).not.toContain('pipeline failed at step 3')
  })
})
