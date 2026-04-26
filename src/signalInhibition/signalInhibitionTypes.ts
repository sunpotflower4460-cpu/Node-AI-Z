/**
 * Signal Inhibition Types
 *
 * Implements competition and lateral inhibition for Signal Mode.
 * Prevents everything from connecting to everything else.
 */

export type SignalCompetitionResult = {
  dominantAssemblyIds: string[]
  coactiveAssemblyIds: string[]
  suppressedAssemblyIds: string[]
  inhibitionStrength: number
  notes: string[]
}
