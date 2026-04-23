import type { BrainState } from '../brainState'
import type { L4Result, NeedType } from '../L4/types'
import type { L5Result } from './types'
import type { PredictionError } from '../prediction/types'

const NEED_WARMTH_BASE: Record<NeedType, number> = {
  connection: 0.6,
  expression: 0.4,
  reflection: 0.2,
  information: 0.0,
  action: 0.1,
  acknowledgment: 0.3,
  unclear: -0.1,
}

const MOOD_WARMTH_ADJUSTMENT: Record<BrainState['mood'], number> = {
  light: 0.1,
  heavy: -0.2,
  uncertain: -0.1,
  neutral: 0,
}

/**
 * Generates a reaction-state interpretation from the semantic frame.
 *
 * @param l4Result - Semantic-layer result.
 * @param brainState - Current brain state.
 * @param predictionError - Prediction error from previous turn (null on first turn).
 * @returns Reaction-layer result.
 */
export function runL5(
  l4Result: L4Result,
  brainState: BrainState,
  predictionError: PredictionError | null,
): L5Result {
  const { need, relation, contextModifier, gist } = l4Result.frame
  const wantToRespond = !(need === 'unclear' && brainState.mood === 'heavy')
  const feelsSafe = !(brainState.mood === 'heavy' && need === 'expression')
  const feelsRelevant = determineRelevance(l4Result)
  const feelsUrgent = need === 'action'
  let warmth = clampWarmth(NEED_WARMTH_BASE[need] + MOOD_WARMTH_ADJUSTMENT[brainState.mood])
  const reactedTo = buildReactedTo(need, brainState, contextModifier)
  let snag = determineSnag(need, gist, relation)

  // Apply prediction error adjustments
  if (predictionError !== null) {
    if (predictionError.surprise > 0.5) {
      snag = snag !== null ? snag : '予想と違う展開になった'
    }
    if (predictionError.surprise > 0.3) {
      warmth -= 0.1
      warmth = clampWarmth(warmth)
    }
  }

  return {
    reaction: {
      wantToRespond,
      feelsSafe,
      feelsRelevant,
      feelsUrgent,
      warmth,
      reactedTo,
      snag,
    },
  }
}

/**
 * Determines whether the input feels relevant enough to respond to.
 *
 * @param l4Result - Semantic-layer result.
 * @returns Relevance flag.
 */
function determineRelevance(l4Result: L4Result): boolean {
  const { need, relation } = l4Result.frame

  if (relation === 'continuation' || relation === 'response' || relation === 'deepening') {
    return true
  }

  if (relation === 'new_topic' && need === 'connection') {
    return true
  }

  if (need === 'information') {
    return true
  }

  return need !== 'unclear'
}

/**
 * Clamps warmth into the supported range.
 *
 * @param value - Raw warmth score.
 * @returns Clamped warmth score.
 */
function clampWarmth(value: number): number {
  return Math.max(-1, Math.min(1, value))
}

/**
 * Builds short natural-language reaction targets.
 *
 * @param need - Semantic need.
 * @param brainState - Current brain state.
 * @param contextModifier - Optional context modifier.
 * @returns Up to three reaction target strings.
 */
function buildReactedTo(
  need: NeedType,
  brainState: BrainState,
  contextModifier: string | null,
): string[] {
  const reactedTo: string[] = []
  const pushUnique = (value: string): void => {
    if (!reactedTo.includes(value) && reactedTo.length < 3) {
      reactedTo.push(value)
    }
  }

  switch (need) {
    case 'connection':
      pushUnique('挨拶されている')
      break
    case 'information':
      pushUnique('何かを知りたがっている')
      break
    case 'expression':
      pushUnique('気持ちを打ち明けられている')
      break
    case 'reflection':
      pushUnique('一緒に考えようとしている')
      break
    case 'action':
      pushUnique('何かをしてほしそう')
      break
    case 'acknowledgment':
      pushUnique('状況を共有されている')
      break
    case 'unclear':
      pushUnique('意図がまだ曖昧')
      break
  }

  if (brainState.mood === 'heavy' && need === 'expression') {
    pushUnique('重い話題が続いている')
  }

  if (contextModifier !== null) {
    pushUnique('気遣いが含まれていそう')
  }

  return reactedTo
}

/**
 * Determines whether the reaction hits a conversational snag.
 *
 * @param need - Semantic need.
 * @param gist - Semantic gist.
 * @param relation - Discourse relation.
 * @returns Snag string when applicable.
 */
function determineSnag(
  need: NeedType,
  gist: string,
  relation: L4Result['frame']['relation'],
): string | null {
  if (need === 'unclear') {
    return '何を求められているか掴めない'
  }

  if (relation === 'continuation' && gist.includes('続きを言おうとしている')) {
    return 'まだ話が途中のようだ'
  }

  return null
}
