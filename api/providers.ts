import { getProviderAvailability } from '../src/server/providerAvailability'
import type { ProvidersResponse } from '../src/types/surface'

type RequestLike = {
  method?: string
}

type ResponseLike = {
  status: (code: number) => ResponseLike
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

export default function handler(_request: RequestLike, response: ResponseLike) {
  response.setHeader('Cache-Control', 'no-store')

  const body: ProvidersResponse = {
    providers: getProviderAvailability(process.env),
  }

  response.status(200).json(body)
}
