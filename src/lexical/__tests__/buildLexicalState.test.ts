import { describe, expect, it } from 'vitest'
import { chunkText } from '../../signal/ingest/chunkText'
import { buildLexicalState } from '../buildLexicalState'

describe('buildLexicalState', () => {
  it('derives lexical request information from raw text and options', () => {
    const text = '仕事に対する意欲が湧かなくて、転職すべきか今の職場で続けるべきか悩んでいます。どうしたらいいですか？'
    const lexicalState = buildLexicalState({
      rawText: text,
      chunks: chunkText(text),
      detectedOptions: [
        { id: 'option:change', label: '転職', sourceChunkIds: ['chunk:1'] },
        { id: 'option:stay', label: '続ける', sourceChunkIds: ['chunk:1'] },
      ],
    })

    expect(lexicalState.explicitQuestion).toBe(true)
    expect(lexicalState.requestType).toBe('choice')
    expect(lexicalState.optionLabels).toEqual(['転職', '続ける'])
    expect(lexicalState.explicitEntities).toContain('仕事')
    expect(lexicalState.explicitTensions?.some((tension) => tension.includes('続ける') || tension.includes('変える'))).toBe(true)
  })
})
