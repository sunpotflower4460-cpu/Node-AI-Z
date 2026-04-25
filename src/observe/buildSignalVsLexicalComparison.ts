import type { ProtoMeaning } from '../meaning/types'
import type { ProtoMeaningSeed, MixedLatentSeed } from '../signalField/signalFieldTypes'

export type LexicalSignalComparisonRow = {
  dimension: string
  lexicalValue: string
  signalValue: string
}

export type SignalVsLexicalComparison = {
  lexicalChunks: string[]
  signalAssemblies: string[]
  lexicalProtoCandidates: string[]
  signalProtoSeeds: string[]
  lexicalMeaningBias: string[]
  signalLatentBias: string[]
  rows: LexicalSignalComparisonRow[]
}

/**
 * Build a side-by-side comparison of the lexical/chunk path vs the Signal Field path.
 * Intended for the Observe layer so both input routes are visible.
 */
export function buildSignalVsLexicalComparison(params: {
  lexicalChunks?: string[]
  signalAssemblyIds?: string[]
  lexicalSensoryMeanings?: ProtoMeaning[]
  lexicalNarrativeMeanings?: ProtoMeaning[]
  signalProtoSeeds?: ProtoMeaningSeed[]
  signalMixedSeeds?: MixedLatentSeed[]
}): SignalVsLexicalComparison {
  const {
    lexicalChunks = [],
    signalAssemblyIds = [],
    lexicalSensoryMeanings = [],
    lexicalNarrativeMeanings = [],
    signalProtoSeeds = [],
    signalMixedSeeds = [],
  } = params

  const lexicalProtoCandidates = [
    ...lexicalSensoryMeanings.map(m => `[sensory] ${m.glossJa} (${m.strength.toFixed(2)})`),
    ...lexicalNarrativeMeanings.map(m => `[narrative] ${m.glossJa} (${m.strength.toFixed(2)})`),
  ]

  const signalProtoSeedLabels = signalProtoSeeds.map(
    s => `[${s.seedType}] ${s.features.join(',')} (${s.strength.toFixed(2)})`,
  )

  // Derive lexical meaning bias from top proto meanings
  const allLexical = [...lexicalSensoryMeanings, ...lexicalNarrativeMeanings].sort(
    (a, b) => b.strength - a.strength,
  )
  const lexicalMeaningBias = allLexical.slice(0, 3).map(m => m.glossJa)

  // Derive signal latent bias from mixed latent seed axes
  const signalLatentBias: string[] = []
  for (const seed of signalMixedSeeds) {
    const topAxis = topAxisOf(seed.axes)
    if (topAxis) signalLatentBias.push(`${topAxis}=${seed.axes[topAxis as keyof typeof seed.axes]?.toFixed(2)}`)
  }

  const rows: LexicalSignalComparisonRow[] = [
    {
      dimension: 'input chunks',
      lexicalValue: lexicalChunks.join(', ') || '(none)',
      signalValue: `${signalAssemblyIds.length} assemblies`,
    },
    {
      dimension: 'proto candidates',
      lexicalValue: lexicalProtoCandidates.slice(0, 3).join('; ') || '(none)',
      signalValue: signalProtoSeedLabels.slice(0, 3).join('; ') || '(none)',
    },
    {
      dimension: 'meaning bias',
      lexicalValue: lexicalMeaningBias.join(', ') || '(none)',
      signalValue: signalLatentBias.join(', ') || '(none)',
    },
  ]

  return {
    lexicalChunks,
    signalAssemblies: signalAssemblyIds,
    lexicalProtoCandidates,
    signalProtoSeeds: signalProtoSeedLabels,
    lexicalMeaningBias,
    signalLatentBias,
    rows,
  }
}

function topAxisOf(axes: Record<string, number | undefined>): string | null {
  let best: string | null = null
  let bestVal = -Infinity
  for (const [k, v] of Object.entries(axes)) {
    if (v !== undefined && v > bestVal) {
      bestVal = v
      best = k
    }
  }
  return best
}
