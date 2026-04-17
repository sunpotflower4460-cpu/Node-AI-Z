export type ProtoMeaningLevel = 'sensory' | 'narrative'

export type ProtoMeaning = {
  id: string
  level: ProtoMeaningLevel
  glossJa: string
  strength: number
  sourceFeatureIds: string[]
  sourceNodeIds: string[]
  sourceBindingIds?: string[]
  childIds?: string[]
  toneTags?: string[]
}

export type ProtoMeaningHierarchy = {
  sensory: ProtoMeaning[]
  narrative: ProtoMeaning[]
  all: ProtoMeaning[]
}
