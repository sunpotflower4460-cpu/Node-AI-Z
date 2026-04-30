import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AnalyzeInputArea } from '../AnalyzeInputArea'

const defaultProps = {
  inputText: '',
  isAnalyzing: false,
  onInputChange: () => {},
  onAnalyze: () => {},
  onSampleClick: () => {},
}

describe('AnalyzeInputArea', () => {
  it('renders input field', () => {
    const html = renderToString(<AnalyzeInputArea {...defaultProps} />)
    expect(html).toContain('観察対象のテキスト')
  })

  it('renders Analyze button', () => {
    const html = renderToString(<AnalyzeInputArea {...defaultProps} />)
    expect(html).toContain('Analyze')
  })

  it('disables Analyze button when input is empty', () => {
    const html = renderToString(<AnalyzeInputArea {...defaultProps} inputText="" />)
    expect(html).toContain('disabled')
  })

  it('shows empty hint when showEmptyHint is true', () => {
    const html = renderToString(<AnalyzeInputArea {...defaultProps} showEmptyHint={true} />)
    expect(html).toContain('まず短い文章を入力してください')
  })
})
