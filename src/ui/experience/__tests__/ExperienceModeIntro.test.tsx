import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ExperienceModeIntro } from '../ExperienceModeIntro'

describe('ExperienceModeIntro', () => {
  it('renders 体験モード label', () => {
    const html = renderToString(<ExperienceModeIntro />)
    expect(html).toContain('体験モード')
  })

  it('mentions 観察モード', () => {
    const html = renderToString(<ExperienceModeIntro />)
    expect(html).toContain('観察モード')
  })

  it('keeps description short and does not mention internal pipeline details', () => {
    const html = renderToString(<ExperienceModeIntro />)
    expect(html).not.toContain('runMainRuntime')
    expect(html).not.toContain('Surface Provider')
  })

  it('renders observe mode link button when handler provided', () => {
    const html = renderToString(<ExperienceModeIntro onObserveModeClick={() => {}} />)
    expect(html).toContain('button')
    expect(html).toContain('観察モード')
  })
})
