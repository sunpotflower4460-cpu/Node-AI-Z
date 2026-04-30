import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AnalyzeFlowCard } from '../AnalyzeFlowCard'

const defaultProps = {
  inputText: '',
  isAnalyzing: false,
  currentObservation: null,
  previousObservation: null,
  researchMode: false,
  onInputChange: () => {},
  onAnalyze: () => {},
  onSampleClick: () => {},
  onTabChange: () => {},
}

describe('AnalyzeFlowCard', () => {
  it('shows idle state when no input and no observation', () => {
    const html = renderToString(<AnalyzeFlowCard {...defaultProps} />)
    expect(html).toContain('まず観察したいテキストを入力してください')
  })

  it('shows ready state when input is present', () => {
    const html = renderToString(<AnalyzeFlowCard {...defaultProps} inputText="test input" />)
    expect(html).toContain('Analyze すると')
  })

  it('shows analyzing state when isAnalyzing is true', () => {
    const html = renderToString(<AnalyzeFlowCard {...defaultProps} inputText="test" isAnalyzing={true} />)
    expect(html).toContain('内部パイプラインを観察中')
  })

  it('shows error state when errorMessage is set', () => {
    const html = renderToString(
      <AnalyzeFlowCard {...defaultProps} errorMessage="something went wrong" />
    )
    expect(html).toContain('Analyze に失敗しました')
  })

  it('Analyze button is disabled when input is empty', () => {
    const html = renderToString(<AnalyzeFlowCard {...defaultProps} inputText="" />)
    expect(html).toContain('disabled')
  })
})
