import type { BrainState } from '../brainState'
import type { L4Result } from '../L4/types'
import type { L5Result } from '../L5/types'
import type { Decision, L6Result } from '../L6/types'
import { UTTERANCE_TEMPLATES, type UtteranceTemplateContext } from './templates'
import type { L7Result } from './types'

const DEFAULT_UNCERTAINTY_PREFIX = 'たぶん、'

/**
 * Renders the final utterance from semantic, reaction, and decision results.
 *
 * @param l4Result - Semantic-layer result.
 * @param l5Result - Reaction-layer result.
 * @param l6Result - Decision-layer result.
 * @param brainState - Current brain state.
 * @returns L7 utterance-generation result.
 */
export function runL7(
  l4Result: L4Result,
  l5Result: L5Result,
  l6Result: L6Result,
  brainState: BrainState,
): L7Result {
  const templateKey = resolveTemplateKey(l6Result.decision)
  const template = UTTERANCE_TEMPLATES[templateKey] ?? UTTERANCE_TEMPLATES.ask_back_short
  const appliedModifiers: string[] = []
  const context = buildTemplateContext(l4Result, l5Result, l6Result, brainState)
  let utterance = template(context)

  if (l6Result.decision.showUncertainty) {
    utterance = applyUncertaintyPrefix(utterance)
    appliedModifiers.push('uncertainty_prefix')
  }

  if (context.askBackPrompt) {
    appliedModifiers.push('ask_back_suffix')
  }

  return {
    utterance: normalizeUtterance(utterance),
    templateKey,
    appliedModifiers,
  }
}

/**
 * Resolves the template key from the decision state.
 *
 * @param decision - L6 decision.
 * @returns Template key.
 */
function resolveTemplateKey(decision: Decision): string {
  if (decision.action === 'greet_back') {
    return `greet_back_${decision.warmthBand}`
  }

  return `${decision.action}_${decision.length}`
}

/**
 * Builds the template-rendering context.
 *
 * @param l4Result - Semantic-layer result.
 * @param l5Result - Reaction-layer result.
 * @param l6Result - Decision-layer result.
 * @param brainState - Current brain state.
 * @returns Template context.
 */
function buildTemplateContext(
  l4Result: L4Result,
  l5Result: L5Result,
  l6Result: L6Result,
  brainState: BrainState,
): UtteranceTemplateContext {
  return {
    topic: l6Result.decision.topic,
    fallbackTopic: brainState.recentTopics[0] ?? 'そのこと',
    askBackPrompt: buildAskBackPrompt(l4Result, l6Result.decision),
    warmthBand: l6Result.decision.warmthBand,
    need: l4Result.frame.need,
    reactedTo: l5Result.reaction.reactedTo,
  }
}

/**
 * Builds an ask-back prompt suited to the current action.
 *
 * @param l4Result - Semantic-layer result.
 * @param decision - L6 decision.
 * @returns Ask-back prompt string or empty string.
 */
function buildAskBackPrompt(l4Result: L4Result, decision: Decision): string {
  if (!decision.askBack) {
    return ''
  }

  switch (decision.action) {
    case 'greet_back':
      return 'そっちはどう？'
    case 'listen':
      return 'もう少し聞かせて。'
    case 'explore':
      return 'どこから考えたい？'
    case 'answer':
      return 'どのあたりが気になる？'
    case 'ask_back':
      return buildClarificationPrompt(l4Result)
    case 'express':
      return '続けても大丈夫だよ。'
    case 'deflect':
      return '別の角度からなら話せるかも。'
    case 'wait':
      return ''
  }
}

/**
 * Builds a clarification prompt for ask-back turns.
 *
 * @param l4Result - Semantic-layer result.
 * @returns Clarification prompt.
 */
function buildClarificationPrompt(l4Result: L4Result): string {
  if (l4Result.frame.need === 'action') {
    return 'してほしいことを少し具体的に教えて。'
  }

  return 'もう少し詳しく教えて。'
}

/**
 * Applies a lightweight uncertainty prefix.
 *
 * @param utterance - Base utterance.
 * @returns Prefixed utterance.
 */
function applyUncertaintyPrefix(utterance: string): string {
  return `${DEFAULT_UNCERTAINTY_PREFIX}${utterance}`
}

/**
 * Normalizes whitespace and punctuation spacing in the rendered utterance.
 *
 * @param utterance - Raw utterance text.
 * @returns Normalized utterance string.
 */
function normalizeUtterance(utterance: string): string {
  return utterance.replace(/\s+/gu, ' ').trim()
}
