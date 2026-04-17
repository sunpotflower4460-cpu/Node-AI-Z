/**
 * Knowledge layer.
 * Holds longer-lived info structures and selection hooks beyond per-session runtime state.
 */
export type { InfoEntry, InfoLayer } from './types'

export { createInfoLayer, updateInfoLayer, upsertInfoEntry } from './updateInfoLayer'
export { selectInfoCandidates } from './selectInfoCandidates'
