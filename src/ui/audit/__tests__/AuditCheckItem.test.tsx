import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { AuditCheckItem } from '../AuditCheckItem'
import type { UiAuditCheck } from '../uiAuditTypes'

const check: UiAuditCheck = {
  id: 'test',
  label: 'テストチェック',
  description: 'テスト説明',
  status: 'pass',
  severity: 'medium',
}

describe('AuditCheckItem', () => {
  it('renders check label', () => {
    const html = renderToString(createElement(AuditCheckItem, { check }))
    expect(html).toContain('テストチェック')
  })

  it('renders recommendation if present', () => {
    const checkWithRec = { ...check, recommendation: '修正してください' }
    const html = renderToString(createElement(AuditCheckItem, { check: checkWithRec }))
    expect(html).toContain('修正してください')
  })
})
