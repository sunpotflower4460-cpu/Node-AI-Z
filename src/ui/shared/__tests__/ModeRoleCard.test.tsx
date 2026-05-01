import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { ModeRoleCard } from '../ModeRoleCard'

describe('ModeRoleCard', () => {
  it('renders both observe and experience role cards', () => {
    const html = renderToString(createElement(ModeRoleCard, {}))
    expect(html).toContain('観察')
    expect(html).toContain('発火・成長・リスクを見る')
    expect(html).toContain('体験')
    expect(html).toContain('自然に話して反応を受け取る')
  })
})
