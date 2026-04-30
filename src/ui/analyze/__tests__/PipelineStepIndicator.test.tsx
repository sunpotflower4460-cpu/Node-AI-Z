import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { PipelineStepIndicator } from '../PipelineStepIndicator'

describe('PipelineStepIndicator', () => {
  it('renders simple steps by default', () => {
    const html = renderToString(<PipelineStepIndicator />)
    expect(html).toContain('入力を受け取る')
  })

  it('renders research steps in research mode', () => {
    const html = renderToString(<PipelineStepIndicator researchMode={true} />)
    expect(html).toContain('ignition')
  })

  it('marks current step as active', () => {
    const html = renderToString(<PipelineStepIndicator currentStepIndex={2} />)
    expect(html).toContain('animate-pulse')
  })

  it('marks past steps as done', () => {
    const html = renderToString(<PipelineStepIndicator currentStepIndex={2} />)
    expect(html).toContain('✓')
  })
})
