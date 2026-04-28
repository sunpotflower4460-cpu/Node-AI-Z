import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MobileOverviewCards } from '../MobileOverviewCards'
import { buildSignalOverviewViewModel } from '../../overview/buildSignalOverviewViewModel'

describe('MobileOverviewCards', () => {
  it('renders with empty viewModel', () => {
    const viewModel = buildSignalOverviewViewModel({ mode: 'signal_mode', observation: null })
    const html = renderToString(createElement(MobileOverviewCards, { viewModel }))
    expect(html).toContain('New Signal Mode')
    expect(html).toContain('Assemblies')
    expect(html).toContain('Bridges')
  })
})
