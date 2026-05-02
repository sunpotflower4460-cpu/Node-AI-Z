import type { SensoryPacket } from './sensoryPacketTypes'
import { extractImageFeatures } from './extractors/extractImageFeatures'
import { normalizeSensoryPacket } from './normalizeSensoryPacket'

/**
 * Creates a SensoryPacket from an image source (HTMLImageElement, HTMLCanvasElement,
 * or ImageBitmap). Extracts low-level photometric and spatial features.
 *
 * Falls back gracefully if Canvas API is unavailable.
 */
export function createImageSensoryPacket(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  options: {
    source?: SensoryPacket['source']
    isTeacherInjected?: boolean
    timestamp?: number
    filename?: string
    metadata?: Record<string, unknown>
  } = {},
): SensoryPacket {
  const {
    source: packetSource = 'external',
    isTeacherInjected = false,
    timestamp = Date.now(),
    filename,
    metadata,
  } = options

  const srcW = 'naturalWidth' in source
    ? (source as HTMLImageElement).naturalWidth
    : (source as HTMLCanvasElement | ImageBitmap).width
  const srcH = 'naturalHeight' in source
    ? (source as HTMLImageElement).naturalHeight
    : (source as HTMLCanvasElement | ImageBitmap).height

  const features = extractImageFeatures(source)

  const raw: SensoryPacket = {
    id: `sensory_image_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: timestamp,
    modality: 'image',
    source: packetSource,
    rawSummary: {
      kind: 'image',
      size: srcW * srcH,
      description: filename ?? `${srcW}x${srcH}`,
    },
    features,
    confidence: {
      extractionConfidence: srcW > 0 && srcH > 0 ? 0.9 : 0.3,
      modalityConfidence: 1.0,
    },
    tags: {
      isExternal: packetSource === 'external',
      isSynthetic: packetSource === 'self_generated',
      isTeacherInjected,
      isReplay: packetSource === 'internal_replay',
    },
    ...(metadata ? { metadata } : {}),
  }

  return normalizeSensoryPacket(raw)
}
