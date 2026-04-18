export type ProtoMeaningLevel = 'sensory' | 'narrative'

export type ProtoMeaning = {
  id: string
  level: ProtoMeaningLevel
  glossJa: string
  strength: number
  /** Micro-cues (or analogous feature ids) that seeded this meaning */
  sourceCueIds: string[]
  /** Optional higher-level node ids that also supported the meaning */
  sourceNodeIds?: string[]
  /** Optional binding ids when derived from node relations */
  sourceBindingIds?: string[]
  /** Child proto-meaning ids (narrative meanings should reference sensory ids) */
  childIds?: string[]
  toneTags?: string[]
}

export type ProtoMeaningHierarchy = {
  sensory: ProtoMeaning[]
  narrative: ProtoMeaning[]
  all: ProtoMeaning[]
}
