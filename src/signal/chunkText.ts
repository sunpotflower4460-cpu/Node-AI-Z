import type { MeaningChunk } from './chunkTypes'

/**
 * Split raw Japanese text into meaning chunks.
 *
 * The split boundary is "the smallest unit in which meaning stands
 * autonomously" — typically a Japanese clause bounded by:
 *   - 、（読点）
 *   - 。（句点）
 *   - conjunctive te-form endings: …て / …で (followed by space or next clause)
 *   - reliable clause conjunctions: けど・けれど・から・ので・のに・ながら
 *
 * Note: 「が」 and 「し」 are intentionally omitted as split points because
 * they also appear as subject / verb particles mid-phrase and produce too
 * many false splits (e.g., 「意欲が湧かない」→ wrong split on が).
 *
 * Chunks shorter than 2 characters after trimming are discarded.
 */
export const chunkText = (text: string): MeaningChunk[] => {
  // Normalise full-width space and trim
  const normalised = text.replace(/\u3000/g, ' ').trim()
  if (!normalised) {
    return []
  }

  // Split on 、。 and reliable clause-level conjunctions
  const rawParts = normalised
    .split(/[、。]|(?<=[てで])\s*(?=[^\s])|(?<=(?:けど|けれど|から|ので|のに|ながら))\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)

  if (rawParts.length === 0) {
    // Fallback: treat the whole text as one chunk
    return [{ text: normalised, index: 0 }]
  }

  return rawParts.map((text, index) => ({ text, index }))
}
