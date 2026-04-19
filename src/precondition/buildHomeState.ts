import type { HomeState } from './types'

/**
 * Builds the Home precondition layer.
 * Home = "where we return to before speaking"
 * This is a stable baseline, not an output decoration.
 */
export const buildHomeState = (): HomeState => {
  return {
    releaseUrgency: 0.3, // moderate urgency to release thoughts
    releaseOverperformance: 0.2, // low tendency to over-elaborate
    returnBeforeOutput: 0.7, // strong tendency to center before speaking
    allowOneLivingThread: 0.8, // high preference for single coherent thread
    noEarlySummary: 0.6, // moderate avoidance of premature conclusions
  }
}
