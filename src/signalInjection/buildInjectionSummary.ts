import type { InjectionEvent, InjectionSummary } from './signalInjectionTypes'

/**
 * Builds a compact summary from a list of injection events.
 * Useful for UI display and Observe panel reporting.
 */
export function buildInjectionSummary(events: InjectionEvent[]): InjectionSummary {
  if (events.length === 0) {
    return {
      totalInjected: 0,
      modalityCounts: {},
      meanStrength: 0,
      lastInjectedAt: null,
      recentEvents: [],
    }
  }

  const modalityCounts: Record<string, number> = {}
  let strengthSum = 0
  let lastAt = 0

  for (const event of events) {
    modalityCounts[event.modality] = (modalityCounts[event.modality] ?? 0) + 1
    strengthSum += event.stimulusStrength
    if (event.injectedAt > lastAt) lastAt = event.injectedAt
  }

  return {
    totalInjected: events.length,
    modalityCounts,
    meanStrength: strengthSum / events.length,
    lastInjectedAt: lastAt,
    recentEvents: events.slice(-10),
  }
}
