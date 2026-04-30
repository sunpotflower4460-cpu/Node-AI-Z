import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { FirstActionCard } from '../FirstActionCard'

describe('FirstActionCard', () => {
  const defaultProps = {
    inputText: '',
    isAnalyzing: false,
    onInputChange: () => {},
    onAnalyze: () => {},
    onSampleClick: () => {},
  }

  it('renders input field', () => {
    const html = renderToString(<FirstActionCard {...defaultProps} />)
    expect(html).toContain('観察対象のテキスト')
  })

  it('renders Analyze button', () => {
    const html = renderToString(<FirstActionCard {...defaultProps} />)
    expect(html).toContain('Analyze')
  })

  it('renders heading instruction', () => {
    const html = renderToString(<FirstActionCard {...defaultProps} />)
    expect(html).toContain('まず1回観察する')
  })

  it('disables Analyze button when input is empty', () => {
    const html = renderToString(<FirstActionCard {...defaultProps} inputText="" />)
    expect(html).toContain('disabled')
  })
})
