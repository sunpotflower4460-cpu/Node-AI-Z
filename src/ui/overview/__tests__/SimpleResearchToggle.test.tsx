import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SimpleResearchToggle } from '../SimpleResearchToggle'

describe('SimpleResearchToggle', () => {
  it('renders the selected detail mode', () => {
    const html = renderToString(<SimpleResearchToggle detailMode="research" onChange={() => undefined} />)

    expect(html).toContain('Simple')
    expect(html).toContain('Research')
    expect(html).toContain('aria-pressed="true"')
  })
})
