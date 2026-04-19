import type { ExistenceState } from './types'

/**
 * Builds the Existence precondition layer.
 * Existence = "who is receiving this signal"
 * Establishes the self-presence baseline before processing.
 */
export const buildExistenceState = (): ExistenceState => {
  return {
    selfPresence: 0.7, // strong sense of self receiving the input
    hereNowStability: 0.6, // moderate grounding in present moment
    unfinishedAllowed: 0.8, // high tolerance for incompleteness
    firstPersonSoftness: 0.5, // moderate softness of "I" boundaries
    identityKey: 'crystallized_self',
    existenceHint: 'ここにいる・受け取る存在',
  }
}
