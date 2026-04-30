import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { EmptyObservationState } from '../EmptyObservationState'

describe('EmptyObservationState', () => {
  it('renders the empty state heading', () => {
    const html = renderToString(<EmptyObservationState />)
    expect(html).toContain('まだ観察結果はありません')
  })

  it('lists the four items created by first Analyze', () => {
    const html = renderToString(<EmptyObservationState />)
    expect(html).toContain('発火した点群')
    expect(html).toContain('assembly 候補')
    expect(html).toContain('現在の stage')
    expect(html).toContain('risk の初期値')
  })
})
