import { generateSurfaceReplyFromProvider } from '../src/server/surfaceProviders'
import type { SurfaceChatRequest } from '../src/types/surface'

type RequestLike = {
  method?: string
  body?: unknown
}

type ResponseLike = {
  status: (code: number) => ResponseLike
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

const parseRequestBody = (body: unknown): Partial<SurfaceChatRequest> => {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Partial<SurfaceChatRequest>
    } catch {
      return {}
    }
  }

  if (body && typeof body === 'object') {
    return body as Partial<SurfaceChatRequest>
  }

  return {}
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method && request.method !== 'POST') {
    response.status(405).json({
      text: '',
      requestedProvider: 'internal_mock',
      usedProvider: 'internal_mock',
      fellBack: true,
      fallbackReason: 'Method not allowed',
    })
    return
  }

  const payload = parseRequestBody(request.body)
  if (!payload.provider || !payload.prompt || typeof payload.fallbackText !== 'string') {
    response.status(400).json({
      text: '',
      requestedProvider: payload.provider ?? 'internal_mock',
      usedProvider: 'internal_mock',
      fellBack: true,
      fallbackReason: 'Invalid request payload',
    })
    return
  }

  const result = await generateSurfaceReplyFromProvider(
    payload.provider,
    payload.prompt,
    payload.fallbackText,
    process.env,
  )

  response.status(200).json(result)
}
