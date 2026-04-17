import type { PhrasePlan, ProtoMeaning, WordCandidate } from './types'

export const bindSignalPhrases = (
  wordCandidates: WordCandidate[],
  protoMeanings: ProtoMeaning[],
): PhrasePlan[] => {
  const plans: PhrasePlan[] = []

  // Each word candidate becomes at least one phrase plan
  for (let i = 0; i < wordCandidates.length; i++) {
    const candidate = wordCandidates[i]
    const pm = protoMeanings.find((p) => p.id === candidate.protoMeaningId)
    if (!candidate.words[0]) continue

    plans.push({
      order: i,
      phrase: candidate.words[0],
      sourceProtoMeanings: [candidate.protoMeaningId],
    })

    // If there is a second word and a related proto-meaning, combine them
    if (i + 1 < wordCandidates.length && candidate.words[1] && pm) {
      const nextCandidate = wordCandidates[i + 1]
      const nextPm = protoMeanings.find((p) => p.id === nextCandidate.protoMeaningId)
      if (nextPm && Math.abs(pm.valence - nextPm.valence) < 0.5) {
        plans.push({
          order: i + 0.5,
          phrase: candidate.words[1],
          sourceProtoMeanings: [candidate.protoMeaningId, nextCandidate.protoMeaningId],
        })
      }
    }
  }

  return plans.sort((a, b) => a.order - b.order)
}
