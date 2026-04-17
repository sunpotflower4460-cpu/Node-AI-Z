import type { InfoLayer, InfoEntry } from './types'

/**
 * Create a blank info layer.
 */
export const createInfoLayer = (): InfoLayer => ({
  entries: [],
  lastUpdated: new Date().toISOString(),
})

/**
 * Update access metadata for info entries whose keys were used this turn.
 * Called only when info layer access is needed (必要時のみ).
 */
export const updateInfoLayer = (layer: InfoLayer, usedKeys: string[]): InfoLayer => {
  if (usedKeys.length === 0) return layer

  const now = new Date().toISOString()
  const keySet = new Set(usedKeys)

  const entries: InfoEntry[] = layer.entries.map((entry) =>
    keySet.has(entry.key)
      ? { ...entry, useCount: entry.useCount + 1, lastUsed: now }
      : entry,
  )

  return { entries, lastUpdated: now }
}

/**
 * Add a new entry or update an existing entry's content and relevance.
 */
export const upsertInfoEntry = (
  layer: InfoLayer,
  entry: Omit<InfoEntry, 'useCount' | 'lastUsed'>,
): InfoLayer => {
  const now = new Date().toISOString()
  const existingIndex = layer.entries.findIndex((e) => e.key === entry.key)

  if (existingIndex >= 0) {
    const entries = layer.entries.map((e, i) =>
      i === existingIndex ? { ...e, ...entry, lastUsed: now } : e,
    )
    return { entries, lastUpdated: now }
  }

  return {
    entries: [...layer.entries, { ...entry, useCount: 0, lastUsed: now }],
    lastUpdated: now,
  }
}
