import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { EngineSelectorCompact } from '../EngineSelectorCompact'

describe('EngineSelectorCompact', () => {
  it('renders the current engine label', () => {
    const html = renderToString(
      <EngineSelectorCompact selectedEngine="signal_mode" onChange={() => {}} />
    )
    expect(html).toContain('New Signal')
  })

  it('renders Legacy label when crystallized_thinking_legacy is selected', () => {
    const html = renderToString(
      <EngineSelectorCompact selectedEngine="crystallized_thinking_legacy" onChange={() => {}} />
    )
    expect(html).toContain('Legacy')
  })

  it('renders LLM label when llm_mode is selected', () => {
    const html = renderToString(
      <EngineSelectorCompact selectedEngine="llm_mode" onChange={() => {}} />
    )
    expect(html).toContain('LLM')
  })

  it('renders 変更 button', () => {
    const html = renderToString(
      <EngineSelectorCompact selectedEngine="signal_mode" onChange={() => {}} />
    )
    expect(html).toContain('変更')
  })
})
