import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { CompactInfoRow } from '../CompactInfoRow'

describe('CompactInfoRow', () => {
  it('renders label and value', () => {
    const html = renderToString(
      createElement(CompactInfoRow, { label: '保存状態', value: 'なし' })
    )
    expect(html).toContain('保存状態')
    expect(html).toContain('なし')
  })

  it('applies custom value class', () => {
    const html = renderToString(
      createElement(CompactInfoRow, { label: 'リスク', value: 'Low', valueClass: 'text-emerald-600' })
    )
    expect(html).toContain('text-emerald-600')
  })
})
