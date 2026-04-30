import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ExperienceModePage } from '../ExperienceModePage'
import type { ExperienceMessage } from '../../../types/experience'

const defaultProps = {
  messages: [] as ExperienceMessage[],
  engine: 'signal_mode' as const,
  surfaceProviderLabel: 'TestProvider',
  isSending: false,
  onSend: () => {},
}

describe('ExperienceModePage', () => {
  it('shows 体験モード intro', () => {
    const html = renderToString(<ExperienceModePage {...defaultProps} />)
    expect(html).toContain('体験モード')
  })

  it('shows engine status', () => {
    const html = renderToString(<ExperienceModePage {...defaultProps} />)
    expect(html).toContain('New Signal')
  })

  it('shows empty state when no messages', () => {
    const html = renderToString(<ExperienceModePage {...defaultProps} />)
    expect(html).toContain('まだ体験モードの会話はありません')
  })

  it('does not show Surface Provider in simple view', () => {
    const html = renderToString(<ExperienceModePage {...defaultProps} detailMode="simple" />)
    expect(html).not.toContain('Surface: TestProvider')
  })

  it('shows Surface Provider in research view', () => {
    const html = renderToString(<ExperienceModePage {...defaultProps} detailMode="research" />)
    expect(html).toContain('TestProvider')
  })

  it('mentions 観察モード for navigation', () => {
    const html = renderToString(<ExperienceModePage {...defaultProps} />)
    expect(html).toContain('観察モード')
  })
})
