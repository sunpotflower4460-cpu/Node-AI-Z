import type { BrainState } from '../brainState'
import type { L4Result } from '../L4/types'
import type { L5Result } from '../L5/types'
import type { ActionType, Decision, L6Result, WarmthBand } from './types'

/**
 * Chooses the next conversational action from semantic and reaction layers.
 *
 * @param l4Result - Semantic-layer result.
 * @param l5Result - Reaction-layer result.
 * @param brainState - Current brain state.
 * @returns Decision-layer result.
 */
export function runL6(l4Result: L4Result, l5Result: L5Result, brainState: BrainState): L6Result {
  const { frame } = l4Result
  const { reaction } = l5Result
  const topic = deriveTopic(frame.gist, brainState.recentTopics)
  const topicIsAmbiguous = isAmbiguousTopic(topic, frame.gist)

  let action: ActionType = 'ask_back'
  let length: Decision['length'] = 'short'
  let confidence = 0.45
  let askBack = false
  let reasoning = '状況を確かめるために聞き返す'

  switch (frame.need) {
    case 'connection':
      if (reaction.warmth > 0) {
        action = 'greet_back'
        length = 'short'
        askBack = true
        confidence = 0.8
        reasoning = '挨拶として受け取ったので返す'
      }
      break
    case 'information':
      if (!reaction.feelsSafe || !reaction.wantToRespond) {
        action = 'deflect'
        length = 'short'
        confidence = 0.4
        reasoning = '答えにくいので慎重にかわす'
      } else {
        action = 'answer'
        length = 'medium'
        confidence = 0.8
        reasoning = '情報を求められているので答える'
      }
      break
    case 'expression':
      action = 'listen'
      length = 'short'
      confidence = reaction.feelsSafe ? 0.75 : 0.55
      reasoning = '気持ちが出ているのでまず聞く'
      break
    case 'reflection':
      action = 'explore'
      length = 'medium'
      askBack = true
      confidence = 0.7
      reasoning = '一緒に考えたい問いなので探る'
      break
    case 'action':
      if (topicIsAmbiguous || reaction.snag !== null) {
        action = 'ask_back'
        length = 'short'
        askBack = true
        confidence = 0.55
        reasoning = '依頼内容が曖昧なので聞き返す'
      } else {
        action = 'answer'
        length = 'short'
        confidence = 0.7
        reasoning = '依頼に応じる方針を取る'
      }
      break
    case 'acknowledgment':
      action = 'express'
      length = 'short'
      confidence = 0.65
      reasoning = '共有された状況に応じて返す'
      break
    case 'unclear':
      if (!reaction.wantToRespond) {
        action = 'wait'
        length = 'minimal'
        confidence = 0.3
        reasoning = '何を求められているか曖昧なので待つ'
      } else {
        action = 'ask_back'
        length = 'short'
        askBack = true
        confidence = 0.45
        reasoning = '何を求められているか曖昧なので聞き返す'
      }
      break
  }

  if (action === 'ask_back') {
    askBack = true
  }

  const showUncertainty =
    !reaction.feelsSafe || reaction.snag !== null || !reaction.wantToRespond || confidence < 0.6

  return {
    decision: {
      action,
      topic,
      length,
      confidence,
      showUncertainty,
      askBack,
      reasoning,
      warmthBand: determineWarmthBand(reaction.warmth),
    },
  }
}

/**
 * Derives a short topic string from the semantic gist.
 *
 * @param gist - Semantic gist.
 * @param recentTopics - Recent topic history for fallback.
 * @returns Topic string capped to 40 characters.
 */
function deriveTopic(gist: string, recentTopics: string[]): string {
  const patterns = [
    'について知りたい',
    'について一緒に考えたい',
    'という気持ちを出している',
    'を求めている',
    'と述べている',
  ]

  for (const pattern of patterns) {
    const index = gist.indexOf(pattern)
    if (index > 0) {
      return trimTopic(gist.slice(0, index))
    }
  }

  const trimmed = trimTopic(gist)
  return trimmed || trimTopic(recentTopics[0] ?? '')
}

/**
 * Trims and shortens a topic string.
 *
 * @param value - Raw topic string.
 * @returns Short topic string.
 */
function trimTopic(value: string): string {
  const normalized = value.trim()
  return normalized.length <= 40 ? normalized : normalized.slice(0, 40)
}

/**
 * Checks whether the derived topic is too ambiguous for direct action.
 *
 * @param topic - Derived topic string.
 * @param gist - Original semantic gist.
 * @returns True when the topic is ambiguous.
 */
function isAmbiguousTopic(topic: string, gist: string): boolean {
  if (!topic) {
    return true
  }

  return gist.includes('まだ曖昧') || gist.includes('続きを言おうとしている')
}

/**
 * Converts warmth into a warmth band.
 *
 * @param warmth - Reaction warmth score.
 * @returns Warmth band.
 */
function determineWarmthBand(warmth: number): WarmthBand {
  if (warmth > 0.3) {
    return 'warm'
  }

  if (warmth < -0.3) {
    return 'cool'
  }

  return 'neutral'
}
