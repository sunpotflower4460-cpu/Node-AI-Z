import type { ProtoMeaning, ProtoMeaningHierarchy } from './types'

const sortByStrength = (values: ProtoMeaning[]) => [...values].sort((left, right) => right.strength - left.strength)

export const mergeProtoMeaningHierarchy = (
  sensory: ProtoMeaning[],
  narrative: ProtoMeaning[],
): ProtoMeaningHierarchy => {
  const sortedSensory = sortByStrength(sensory)
  const sortedNarrative = sortByStrength(narrative)

  return {
    sensory: sortedSensory,
    narrative: sortedNarrative,
    all: [...sortedNarrative, ...sortedSensory],
  }
}
