export type ReactionState = {
  wantToRespond: boolean
  feelsSafe: boolean
  feelsRelevant: boolean
  feelsUrgent: boolean
  warmth: number
  reactedTo: string[]
  snag: string | null
}

export type L5Result = {
  reaction: ReactionState
}
