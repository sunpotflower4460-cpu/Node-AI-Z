import type { MeaningChunk } from './ingest/chunkTypes'
import type { SignalPacket } from './packetTypes'

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const measureSalience = (text: string) => {
  const lengthFactor = Math.min(0.22, text.length / 80)
  const questionFactor = /[?？]|どうしたら|すべきか|ですか|ますか/.test(text) ? 0.12 : 0
  const changeFactor = /転職|辞め|変え|休む|相談/.test(text) ? 0.1 : 0
  const distressFactor = /困|悩|つら|しんど|苦/.test(text) ? 0.16 : 0
  return clamp(0.34 + lengthFactor + questionFactor + changeFactor + distressFactor)
}

const measureEmotionalCharge = (text: string) => {
  let score = 0.18
  if (/困|悩|つら|しんど|苦|疲/.test(text)) score += 0.24
  if (/意欲|やる気|気力|自信|信じられない/.test(text)) score += 0.18
  if (/なんとなく|言葉にできない|迷|わから/.test(text)) score += 0.12
  if (/少しだけ|希望|光|できるかも/.test(text)) score += 0.08
  return clamp(score)
}

export const createSignalPackets = (chunks: MeaningChunk[]): SignalPacket[] => {
  return chunks.map((chunk) => ({
    id: `packet:${chunk.index}`,
    source: 'user_input',
    chunkText: chunk.text,
    salience: measureSalience(chunk.text),
    emotionalCharge: measureEmotionalCharge(chunk.text),
    route: ['user_input', `chunk:${chunk.index}`],
  }))
}
