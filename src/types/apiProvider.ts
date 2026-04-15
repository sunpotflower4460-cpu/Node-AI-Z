export type ApiProviderId =
  | 'internal_mock'
  | 'openai'
  | 'anthropic'
  | 'google'

export type ApiProviderConfig = {
  id: ApiProviderId
  label: string
  description: string
  available: boolean
  unavailableReason?: string
}

export type ApiSelectionState = {
  baseProvider: ApiProviderId
  lastUpdatedAt: string
}
