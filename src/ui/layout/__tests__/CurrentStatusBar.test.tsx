import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { CurrentStatusBar } from '../CurrentStatusBar'

describe('CurrentStatusBar', () => {
  const viewModel = {
    engineShortLabel: 'New',
    stageShortLabel: 'Stage 1',
    riskShortLabel: 'Risk Low',
    snapshotShortLabel: '保存なし',
    riskLevel: 'low' as const,
  }

  it('renders engine, stage, risk and snapshot labels', () => {
    const html = renderToString(<CurrentStatusBar viewModel={viewModel} />)
    expect(html).toContain('New')
    expect(html).toContain('Stage 1')
    expect(html).toContain('Risk Low')
    expect(html).toContain('保存なし')
  })

  it('applies emerald color class for low risk', () => {
    const html = renderToString(<CurrentStatusBar viewModel={viewModel} />)
    expect(html).toContain('emerald')
  })

  it('applies red color class for high risk', () => {
    const html = renderToString(
      <CurrentStatusBar viewModel={{ ...viewModel, riskLevel: 'high', riskShortLabel: 'Risk High' }} />
    )
    expect(html).toContain('red')
  })
})
