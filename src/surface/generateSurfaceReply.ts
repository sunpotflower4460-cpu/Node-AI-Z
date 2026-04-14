import type { StudioViewModel } from '../types/nodeStudio'
import type { ApiProviderId } from '../types/apiProvider'

type GenerateSurfaceReplyParams = {
  provider: ApiProviderId
  studioView: StudioViewModel
}

const generateInternalMockReply = (studioView: StudioViewModel) => {
  return studioView.adjustedReplyPreview
}

export const generateSurfaceReply = async ({ provider, studioView }: GenerateSurfaceReplyParams): Promise<string> => {
  switch (provider) {
    case 'openai':
    case 'anthropic':
    case 'google':
      return studioView.adjustedReplyPreview
    case 'internal_mock':
    default:
      return generateInternalMockReply(studioView)
  }
}
