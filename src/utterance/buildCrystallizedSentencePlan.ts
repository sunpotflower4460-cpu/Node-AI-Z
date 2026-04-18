import type { UtteranceIntent, UtteranceShape, LexicalPulls, CrystallizedSentencePlan } from './types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness, OptionDecisionShape } from '../option/types'

export type BuildCrystallizedSentencePlanInput = {
  utteranceIntent: UtteranceIntent
  utteranceShape: UtteranceShape
  lexicalPulls: LexicalPulls
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
  currentDecision?: OptionDecisionShape
}

/**
 * Build CrystallizedSentencePlan
 *
 * Creates the scaffolding for the final reply based on intent, shape, and lexical pulls.
 */
export const buildCrystallizedSentencePlan = ({
  utteranceIntent,
  utteranceShape,
  lexicalPulls,
  sensoryProtoMeanings,
  narrativeProtoMeanings,
  optionAwareness,
  currentDecision,
}: BuildCrystallizedSentencePlanInput): CrystallizedSentencePlan => {
  const plan: CrystallizedSentencePlan = {}

  // Build opening based on openWith
  switch (utteranceShape.openWith) {
    case 'texture':
      if (lexicalPulls.preferredTextures.length > 0) {
        plan.opening = buildTextureOpening(lexicalPulls.preferredTextures, sensoryProtoMeanings)
      }
      break

    case 'meaning':
      if (lexicalPulls.preferredMeaningPhrases.length > 0) {
        plan.opening = buildMeaningOpening(lexicalPulls.preferredMeaningPhrases)
      }
      break

    case 'option':
      if (optionAwareness) {
        plan.opening = buildOptionOpening(optionAwareness, lexicalPulls.preferredOptionPhrases)
      }
      break

    case 'question':
      plan.opening = buildQuestionOpening(utteranceIntent)
      break

    case 'direct_answer':
      // Direct answer goes to answer field, not opening
      break
  }

  // Build core content
  if (narrativeProtoMeanings.length > 0) {
    plan.core = buildCoreContent(narrativeProtoMeanings, lexicalPulls)
  }

  // Build option frame if needed
  if (utteranceShape.includeOptionBalance && optionAwareness) {
    plan.optionFrame = buildOptionFrame(optionAwareness, lexicalPulls.preferredOptionPhrases)
  }

  // Build answer if needed
  if (utteranceIntent.answerForce > 0.5 || utteranceIntent.primaryMove === 'structured_answer') {
    plan.answer = buildAnswer(narrativeProtoMeanings, currentDecision, utteranceIntent)
  }

  // Build bridge if needed
  if (utteranceShape.includeBridge && optionAwareness?.bridgeOptionPossible) {
    plan.bridge = buildBridge(lexicalPulls.preferredOptionPhrases)
  }

  // Build close
  if (utteranceShape.includeQuestionBack) {
    plan.close = buildQuestionClose(utteranceIntent)
  } else {
    plan.close = buildGentleClose(utteranceIntent, lexicalPulls)
  }

  return plan
}

// Helper functions

function buildTextureOpening(textures: string[], sensoryPM: ProtoMeaning[]): string {
  const primaryTexture = textures[0]
  const strongestSensory = sensoryPM.sort((a, b) => b.strength - a.strength)[0]

  if (strongestSensory && strongestSensory.glossJa) {
    return `${strongestSensory.glossJa}という感じが`
  }

  return `${primaryTexture}という感じが`
}

function buildMeaningOpening(phrases: string[]): string {
  const primaryPhrase = phrases[0]
  return primaryPhrase || '何か'
}

function buildOptionOpening(awareness: OptionAwareness, optionPhrases: string[]): string {
  if (awareness.hesitationStrength > 0.5) {
    return optionPhrases.length > 0 ? optionPhrases[0] + 'の間で' : '選択肢の間で'
  }
  return awareness.summaryLabel || '選択肢について'
}

function buildQuestionOpening(intent: UtteranceIntent): string {
  if (intent.warmth > 0.6) {
    return 'どんな感じでしょうか'
  }
  return 'どう感じていますか'
}

function buildCoreContent(narrativePM: ProtoMeaning[], pulls: LexicalPulls): string {
  const topNarrative = narrativePM.sort((a, b) => b.strength - a.strength)[0]

  if (!topNarrative) {
    return ''
  }

  // Use the narrative meaning directly, avoid over-explaining
  if (pulls.avoidOverexplaining) {
    return topNarrative.glossJa
  }

  return `${topNarrative.glossJa}のように見えます`
}

function buildOptionFrame(awareness: OptionAwareness, optionPhrases: string[]): string {
  if (awareness.differenceMagnitude < 0.3) {
    return optionPhrases.length > 0 ? `${optionPhrases[0]}近い` : '拮抗している'
  }

  if (awareness.dominantOptionId) {
    return '一方に寄っている'
  }

  return awareness.summaryLabel
}

function buildAnswer(
  narrativePM: ProtoMeaning[],
  decision: OptionDecisionShape | undefined,
  intent: UtteranceIntent,
): string {
  if (decision?.preferredOptionId) {
    return `${decision.preferredOptionId}の方向`
  }

  const topNarrative = narrativePM.sort((a, b) => b.strength - a.strength)[0]
  if (topNarrative && intent.answerForce > 0.7) {
    return topNarrative.glossJa
  }

  return ''
}

function buildBridge(optionPhrases: string[]): string {
  const bridgePhrase = optionPhrases.find((p) => p.includes('橋') || p.includes('間') || p.includes('両方'))
  return bridgePhrase ? `${bridgePhrase}の道` : '間を探る'
}

function buildQuestionClose(intent: UtteranceIntent): string {
  if (intent.warmth > 0.6) {
    return 'もう少し話してもらえますか'
  }
  return 'どう思いますか'
}

function buildGentleClose(intent: UtteranceIntent, pulls: LexicalPulls): string {
  if (intent.ambiguityTolerance > 0.6) {
    return ''  // Leave it open
  }

  if (pulls.avoidTherapyTone) {
    return ''  // Don't add therapeutic closing
  }

  if (intent.warmth > 0.6) {
    return '大丈夫です'
  }

  return ''
}
