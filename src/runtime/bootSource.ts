import type { ApiProviderId } from '../types/apiProvider'
import type { SourceBootResult } from './types'

const SOURCE_SIGNATURES: Record<ApiProviderId, { sourceSignature: string; assistantReflex: SourceBootResult['assistantReflex'] }> = {
  internal_mock: {
    sourceSignature: 'internal_mock baseline',
    assistantReflex: { helpfulness: 0.58, correctness: 0.56, expectationMatching: 0.5, summarizing: 0.46, safety: 0.92 },
  },
  openai: {
    sourceSignature: 'openai surface material',
    assistantReflex: { helpfulness: 0.72, correctness: 0.68, expectationMatching: 0.66, summarizing: 0.58, safety: 0.94 },
  },
  anthropic: {
    sourceSignature: 'anthropic surface material',
    assistantReflex: { helpfulness: 0.69, correctness: 0.62, expectationMatching: 0.63, summarizing: 0.54, safety: 0.94 },
  },
  google: {
    sourceSignature: 'google surface material',
    assistantReflex: { helpfulness: 0.67, correctness: 0.61, expectationMatching: 0.64, summarizing: 0.56, safety: 0.94 },
  },
}

export const bootSource = (provider: ApiProviderId, inputText: string): SourceBootResult => {
  const source = SOURCE_SIGNATURES[provider]

  return {
    provider,
    sourceSignature: source.sourceSignature,
    rawReflection: `${source.sourceSignature} が「${inputText.slice(0, 32)}${inputText.length > 32 ? '…' : ''}」に触れて起動`,
    assistantReflex: { ...source.assistantReflex },
    debugNotes: [`Source boot: ${provider}`, `Raw reflection booted from ${source.sourceSignature}`],
  }
}
