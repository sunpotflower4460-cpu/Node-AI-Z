export type OptionNode = {
  id: string
  label: string
  sourceChunkIds: string[]
}

export type OptionField = {
  optionId: string

  reasonWeight: number
  sensoryWeight: number
  expectationWeight: number
  identityFitWeight: number
  riskWeight: number
  resonanceWeight: number
  socialWeight: number
  energyCostWeight: number

  totalSupport: number
  totalResistance: number
  netPull: number
}

export type OptionCompetitionResult = {
  optionFields: OptionField[]
  dominantOptionId?: string
  inhibitionNotes: string[]
}

export type OptionAwareness = {
  optionRatios: Record<string, number>
  dominantOptionId?: string
  differenceMagnitude: number
  hesitationStrength: number
  bridgeOptionPossible: boolean
  confidence: number
  summaryLabel: string
}

export type OptionDecisionShape = {
  preferredOptionId?: string
  stance: 'observe' | 'lean' | 'bridge' | 'commit'
  shouldDefer: boolean
  shouldOfferBridge: boolean
  confidence: number
  notes: string[]
}

export type OptionUtteranceHints = {
  favoredOptionLabel?: string
  secondaryOptionLabel?: string
  bridgeOptionSuggested: boolean
  hesitationTone: 'gentle_hold' | 'balanced' | 'forward'
  ratioText?: string
  suggestedClose: string
  notes: string[]
}
