import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ExperienceResponseCard } from '../ExperienceResponseCard'
import type { ExperienceMessage } from '../../../types/experience'

const assistantMessage: ExperienceMessage = {
  id: 'msg-1',
  observationId: 'obs-1',
  role: 'assistant',
  text: 'これはテスト返答です',
  timestamp: new Date().toISOString(),
}

describe('ExperienceResponseCard', () => {
  it('renders response text', () => {
    const html = renderToString(
      <ExperienceResponseCard message={assistantMessage} engineLabel="New Signal" />
    )
    expect(html).toContain('これはテスト返答です')
  })

  it('renders engine badge', () => {
    const html = renderToString(
      <ExperienceResponseCard message={assistantMessage} engineLabel="New Signal" />
    )
    expect(html).toContain('New Signal')
  })

  it('renders BehindTheScenesLink when onNavigateToObserve provided', () => {
    const html = renderToString(
      <ExperienceResponseCard
        message={assistantMessage}
        engineLabel="New Signal"
        onNavigateToObserve={() => {}}
      />
    )
    expect(html).toContain('裏側を見る')
  })

  it('does not render BehindTheScenesLink when onNavigateToObserve not provided', () => {
    const html = renderToString(
      <ExperienceResponseCard message={assistantMessage} engineLabel="New Signal" />
    )
    expect(html).not.toContain('裏側を見る')
  })

  it('shows obs trace id in research mode', () => {
    const html = renderToString(
      <ExperienceResponseCard message={assistantMessage} engineLabel="New Signal" researchMode={true} />
    )
    expect(html).toContain('obs:')
  })

  it('does not show obs trace id in simple mode', () => {
    const html = renderToString(
      <ExperienceResponseCard message={assistantMessage} engineLabel="New Signal" researchMode={false} />
    )
    expect(html).not.toContain('obs:')
  })
})
