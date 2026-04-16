import type { Signal } from '../signal/types'

/**
 * Extract pathway keys from an array of activated signals.
 * Each key uniquely identifies a signal–trigger pair that fired in this turn.
 *
 * Format:
 *   "<signal_id>:<trigger>"  when a specific token triggered the signal
 *   "<signal_id>"            for fallback signals with no trigger token
 */
export const extractPathwayKeys = (signals: Signal[]): string[] => {
  const keys: string[] = []

  for (const signal of signals) {
    if (signal.pathways.length > 0) {
      for (const pathway of signal.pathways) {
        keys.push(`${signal.id}:${pathway}`)
      }
    } else {
      keys.push(signal.id)
    }
  }

  return keys
}
