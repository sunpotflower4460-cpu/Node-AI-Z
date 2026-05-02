import type { SensoryFeatureVector } from '../sensoryPacketTypes'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'

/**
 * Extract low-level structural features from an image using the Canvas API.
 *
 * Features (8 dimensions):
 *  [0] aspectRatio       — min(w,h)/max(w,h); 1 = square, approaches 0 for wide/tall
 *  [1] meanBrightness    — average luminance over all pixels (0-1)
 *  [2] brightnessVariance — variance of luminance (0-1, high = strong contrast)
 *  [3] redMean           — mean red channel (0-1)
 *  [4] greenMean         — mean green channel (0-1)
 *  [5] blueMean          — mean blue channel (0-1)
 *  [6] edgeDensity       — proportion of edge-like pixels (luminance delta > threshold)
 *  [7] spatialActivity   — difference between top-left and bottom-right quadrant means
 *
 * No semantic meaning ("this is a cat") — only spatial / photometric properties.
 * Uses a 32×32 thumbnail internally for speed.
 */
export function extractImageFeatures(
  source: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
): SensoryFeatureVector {
  const THUMB = 32

  // Draw source into an offscreen canvas at 32×32
  const canvas = document.createElement('canvas')
  canvas.width = THUMB
  canvas.height = THUMB
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return zeroFeatures()
  }
  ctx.drawImage(source as CanvasImageSource, 0, 0, THUMB, THUMB)

  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, THUMB, THUMB)
  } catch {
    return zeroFeatures()
  }

  const { data } = imageData
  const pixelCount = THUMB * THUMB

  // Compute original aspect ratio from source dimensions
  let srcW = THUMB
  let srcH = THUMB
  if ('naturalWidth' in source) {
    srcW = (source as HTMLImageElement).naturalWidth || THUMB
    srcH = (source as HTMLImageElement).naturalHeight || THUMB
  } else if ('width' in source) {
    srcW = (source as HTMLCanvasElement | ImageBitmap).width || THUMB
    srcH = (source as HTMLCanvasElement | ImageBitmap).height || THUMB
  }
  const aspectRatio = srcW > 0 && srcH > 0 ? Math.min(srcW, srcH) / Math.max(srcW, srcH) : 1

  // Per-pixel luminance, channel accumulation
  const luminances = new Float32Array(pixelCount)
  let rSum = 0
  let gSum = 0
  let bSum = 0

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4]! / 255
    const g = data[i * 4 + 1]! / 255
    const b = data[i * 4 + 2]! / 255
    // Rec.709 luminance
    luminances[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b
    rSum += r
    gSum += g
    bSum += b
  }

  const meanBrightness = luminances.reduce((s, v) => s + v, 0) / pixelCount
  const redMean = rSum / pixelCount
  const greenMean = gSum / pixelCount
  const blueMean = bSum / pixelCount

  // Brightness variance
  let varSum = 0
  for (let i = 0; i < pixelCount; i++) {
    const diff = luminances[i]! - meanBrightness
    varSum += diff * diff
  }
  const brightnessVariance = Math.min(1, (varSum / pixelCount) * 4)

  // Edge density: fraction of pixels where horizontal or vertical delta > 0.1
  let edgeCount = 0
  for (let y = 0; y < THUMB; y++) {
    for (let x = 0; x < THUMB; x++) {
      const idx = y * THUMB + x
      const lum = luminances[idx]!
      const right = x + 1 < THUMB ? Math.abs(lum - luminances[idx + 1]!) : 0
      const down = y + 1 < THUMB ? Math.abs(lum - luminances[idx + THUMB]!) : 0
      if (right > 0.1 || down > 0.1) edgeCount++
    }
  }
  const edgeDensity = Math.min(1, edgeCount / pixelCount)

  // Spatial activity: mean brightness top-left quadrant vs bottom-right quadrant
  let tlSum = 0
  let brSum = 0
  const half = THUMB / 2
  for (let y = 0; y < THUMB; y++) {
    for (let x = 0; x < THUMB; x++) {
      const lum = luminances[y * THUMB + x]!
      if (x < half && y < half) tlSum += lum
      else if (x >= half && y >= half) brSum += lum
    }
  }
  const quadPixels = half * half
  const spatialActivity = Math.min(1, Math.abs(tlSum / quadPixels - brSum / quadPixels))

  return {
    values: [
      aspectRatio,
      meanBrightness,
      brightnessVariance,
      redMean,
      greenMean,
      blueMean,
      edgeDensity,
      spatialActivity,
    ],
    dimension: SENSORY_FEATURE_DIM,
    normalized: true,
    featureNames: IMAGE_FEATURE_NAMES,
  }
}

function zeroFeatures(): SensoryFeatureVector {
  return {
    values: Array(SENSORY_FEATURE_DIM).fill(0) as number[],
    dimension: SENSORY_FEATURE_DIM,
    normalized: true,
    featureNames: IMAGE_FEATURE_NAMES,
  }
}

export const IMAGE_FEATURE_NAMES: string[] = [
  'aspectRatio',
  'meanBrightness',
  'brightnessVariance',
  'redMean',
  'greenMean',
  'blueMean',
  'edgeDensity',
  'spatialActivity',
]
