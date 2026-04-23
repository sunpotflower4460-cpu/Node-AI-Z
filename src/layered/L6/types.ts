export type ActionType =
  | 'greet_back'
  | 'answer'
  | 'listen'
  | 'explore'
  | 'ask_back'
  | 'express'
  | 'wait'
  | 'deflect'

export type WarmthBand = 'warm' | 'neutral' | 'cool'

export type Decision = {
  action: ActionType
  topic: string
  length: 'minimal' | 'short' | 'medium' | 'long'
  confidence: number
  showUncertainty: boolean
  askBack: boolean
  reasoning: string
  warmthBand: WarmthBand
}

export type L6Result = {
  decision: Decision
}
