import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ExperienceChatPanel } from '../ExperienceChatPanel'
import type { ExperienceMessage } from '../../../types/experience'

const defaultProps = {
  messages: [] as ExperienceMessage[],
  engineLabel: 'New Signal',
  isSending: false,
  onSend: () => {},
}

describe('ExperienceChatPanel', () => {
  it('shows empty state when no messages', () => {
    const html = renderToString(<ExperienceChatPanel {...defaultProps} />)
    expect(html).toContain('まだ体験モードの会話はありません')
  })

  it('shows input area', () => {
    const html = renderToString(<ExperienceChatPanel {...defaultProps} />)
    expect(html).toContain('今考えていることを入力')
  })

  it('send button says 話す not 送信', () => {
    const html = renderToString(<ExperienceChatPanel {...defaultProps} />)
    expect(html).toContain('話す')
  })

  it('renders messages when present', () => {
    const messages: ExperienceMessage[] = [
      { id: 'u1', observationId: '', role: 'user', text: 'こんにちは', timestamp: new Date().toISOString() },
      { id: 'a1', observationId: 'obs-1', role: 'assistant', text: 'こんにちは！', timestamp: new Date().toISOString() },
    ]
    const html = renderToString(<ExperienceChatPanel {...defaultProps} messages={messages} />)
    expect(html).toContain('こんにちは')
    expect(html).toContain('こんにちは！')
  })
})
