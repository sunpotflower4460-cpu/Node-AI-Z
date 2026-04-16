import type { StimulusPacket } from './types'

const NEGATIVE_TOKENS = ['疲れ', 'つらい', '辛い', '不安', '怖い', 'できない', '無理', '嫌', 'いや', '悩', '苦し', '怒', '泣', '落ち込', '消えたい', '悲し', '焦']
const POSITIVE_TOKENS = ['希望', '前向き', '嬉し', 'よかっ', '楽し', 'うれし', '好き', '感謝', '安心', '嬉しい']

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const computeValence = (text: string): number => {
  let score = 0
  for (const token of NEGATIVE_TOKENS) {
    if (text.includes(token)) score -= 0.2
  }
  for (const token of POSITIVE_TOKENS) {
    if (text.includes(token)) score += 0.2
  }
  return clamp(score, -1, 1)
}

const computeIntensity = (text: string): number => {
  const lengthScore = clamp(text.length / 80, 0, 0.5)
  const punctuationBonus = (text.match(/[！!？?。、…]/g) ?? []).length * 0.05
  const exclamationBonus = (text.match(/[！!]/g) ?? []).length * 0.1
  return clamp(0.3 + lengthScore + punctuationBonus + exclamationBonus, 0.1, 1)
}

const tokenize = (text: string): string[] => {
  return text
    .split(/[\s\u3000、。！？!?,.\n]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

export const createStimulusPacket = (raw: string): StimulusPacket => {
  return {
    raw,
    intensity: computeIntensity(raw),
    valence: computeValence(raw),
    tokens: tokenize(raw),
  }
}
