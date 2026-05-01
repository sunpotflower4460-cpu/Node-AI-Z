import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ExperienceEngineStatus } from '../ExperienceEngineStatus'

describe('ExperienceEngineStatus', () => {
  it('renders engineLabel', () => {
    const html = renderToString(<ExperienceEngineStatus engineLabel="New Signal" />)
    expect(html).toContain('New Signal')
  })

  it('shows 使用中 prefix', () => {
    const html = renderToString(<ExperienceEngineStatus engineLabel="LLM" />)
    expect(html).toContain('使用中')
  })

  it('does not show runtime details in simple mode', () => {
    const html = renderToString(
      <ExperienceEngineStatus engineLabel="New Signal" researchMode={false} runtimeModeLabel="Signal" />
    )
    expect(html).not.toContain('Runtime:')
  })

  it('shows runtime details in research mode', () => {
    const html = renderToString(
      <ExperienceEngineStatus engineLabel="New Signal" researchMode={true} runtimeModeLabel="Signal" />
    )
    expect(html).toContain('Runtime:')
    expect(html).toContain('Signal')
  })

  it('shows surface provider in research mode', () => {
    const html = renderToString(
      <ExperienceEngineStatus engineLabel="New Signal" researchMode={true} surfaceProviderLabel="MockProvider" />
    )
    expect(html).toContain('MockProvider')
  })

  it('does not show surface provider in simple mode', () => {
    const html = renderToString(
      <ExperienceEngineStatus engineLabel="New Signal" researchMode={false} surfaceProviderLabel="MockProvider" />
    )
    expect(html).not.toContain('MockProvider')
  })
})
