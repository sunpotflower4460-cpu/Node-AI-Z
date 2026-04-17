import type { OptionNode } from '../option/types'
import type { MeaningChunk } from '../signal/ingest/chunkTypes'
import type { LexicalState } from './types'

type BuildLexicalStateInput = {
  rawText: string
  chunks: MeaningChunk[]
  detectedOptions?: OptionNode[]
}

const ENTITY_PATTERNS: Array<{ label: string; patterns: string[] }> = [
  { label: '仕事', patterns: ['仕事', '働', '職場', '業務', '会社'] },
  { label: '転職', patterns: ['転職', '辞め', 'やめ', '退職', '新しい職場'] },
  { label: '人間関係', patterns: ['人間関係', '上司', '同僚', '友達', '関係'] },
  { label: '家族', patterns: ['家族', '親', '母', '父', '兄弟', '姉妹'] },
  { label: '恋愛', patterns: ['恋愛', '恋人', 'パートナー'] },
  { label: '将来', patterns: ['将来', 'これから', '今後'] },
  { label: '健康', patterns: ['健康', '体調', '眠れ', '疲れ'] },
]

const TENSION_RULES: Array<{ label: string; patterns: string[] }> = [
  { label: '続ける/離れる', patterns: ['続け', '転職', '辞め', 'やめ', '離れ'] },
  { label: '変える/保つ', patterns: ['変え', '変化', 'このまま', '現状'] },
  { label: '休む/進む', patterns: ['休', '立ち止ま', '進', '動'] },
  { label: '話す/抱える', patterns: ['相談', '話', '聞いて', '抱え'] },
]

const SYNTAX_HINTS: Array<{ label: string; patterns: string[] }> = [
  { label: 'condition', patterns: ['なら', 'たら', 'れば', 'もし'] },
  { label: 'negation', patterns: ['ない', 'なく', 'ず', 'ぬ'] },
  { label: 'comparison', patterns: ['より', '比べ', 'どっち', 'どちら'] },
  { label: 'contrast', patterns: ['けど', 'でも', '一方', 'なのに'] },
  { label: 'question', patterns: ['？', '?', 'ですか', 'ますか', 'でしょうか', 'どうしたら', 'すべきか'] },
]

const uniq = (values: string[]) => [...new Set(values)]

const matchAny = (text: string, patterns: string[]) => patterns.some((pattern) => text.includes(pattern))

const resolveRequestType = (
  text: string,
  explicitQuestion: boolean,
  optionLabels: string[],
): LexicalState['requestType'] => {
  if (optionLabels.length >= 2 || /どっち|どちら|選べ|選ぶべき|AかB|か、それとも/.test(text)) {
    return 'choice'
  }

  if (/どうしたら|どうすれば|すべきか|教えて|整理して|比べ|アドバイス/.test(text)) {
    return 'advice'
  }

  if (/分かってほしい|聞いてほしい|受け止めて|つらい|しんどい|苦しい/.test(text) && !explicitQuestion) {
    return 'comfort'
  }

  if (/なんとなく|言葉にできない|どう感じ|何のため|意味が分から/.test(text)) {
    return 'reflection'
  }

  if (explicitQuestion) {
    return 'advice'
  }

  return undefined
}

export const buildLexicalState = ({
  rawText,
  chunks,
  detectedOptions = [],
}: BuildLexicalStateInput): LexicalState => {
  const text = rawText.trim()
  const optionLabels = uniq(detectedOptions.map((option) => option.label))
  const explicitQuestion = /[?？]/.test(text) || /ですか|ますか|でしょうか|どうしたら|どうすれば|すべきか/.test(text)
  const explicitEntities = ENTITY_PATTERNS
    .filter((entry) => matchAny(text, entry.patterns))
    .map((entry) => entry.label)
  const explicitTensions = uniq([
    ...TENSION_RULES
      .filter((rule) => matchAny(text, rule.patterns))
      .map((rule) => rule.label),
    ...(optionLabels.length >= 2 ? [optionLabels.slice(0, 2).join('/')] : []),
  ])
  const syntaxHints = SYNTAX_HINTS
    .filter((hint) => matchAny(text, hint.patterns))
    .map((hint) => hint.label)

  return {
    chunks,
    explicitQuestion,
    requestType: resolveRequestType(text, explicitQuestion, optionLabels),
    optionLabels: optionLabels.length > 0 ? optionLabels : undefined,
    explicitEntities: explicitEntities.length > 0 ? explicitEntities : undefined,
    explicitTensions: explicitTensions.length > 0 ? explicitTensions : undefined,
    syntaxHints: syntaxHints.length > 0 ? syntaxHints : undefined,
  }
}
