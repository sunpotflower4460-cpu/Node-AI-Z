import type { SignalBridgeRecord } from './signalBranchTypes'

/**
 * Compute how successfully a bridge can be recalled without teacher assistance.
 *
 * High recall success (close to 1.0):
 * - Many self-recall successes
 * - Few failed recalls
 * - Bridge is stable and reliable
 *
 * Low recall success (close to 0.0):
 * - Few self-recall successes
 * - Many failed recalls
 * - Bridge is unstable or weak
 *
 * @returns Score from 0.0 (poor recall) to 1.0 (excellent recall)
 */
export function computeRecallSuccess(record: SignalBridgeRecord): number {
  const selfAttempts = record.selfRecallSuccessCount + record.failedRecallCount

  if (selfAttempts === 0) {
    // No self-recall attempts yet
    // If created by self, assume moderate success; if by teacher, assume low success
    return record.createdBy === 'self_discovered' ? 0.5 : 0.0
  }

  // Basic success rate
  const successRate = record.selfRecallSuccessCount / selfAttempts

  // Apply confidence weighting
  // Higher confidence bridges get a slight boost
  const confidenceBoost = record.confidence * 0.1

  // Apply recency penalty for bridges that haven't been used recently
  // (This prevents overestimating old bridges that may have degraded)
  const timeSinceUse = Date.now() - record.lastUsedAt
  const recencyPenalty = timeSinceUse > 100_000 ? 0.1 : 0.0

  const finalScore = Math.max(0.0, Math.min(1.0, successRate + confidenceBoost - recencyPenalty))

  return finalScore
}
