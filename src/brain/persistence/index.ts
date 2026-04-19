/**
 * Brain Persistence Module
 * Adapters for persisting SessionBrainState to various storage backends.
 *
 * Phase M1: Local persistence via localStorage
 * Future: Remote persistence via Supabase/Firebase
 */

export type { BrainPersistenceAdapter } from './types'
export { localBrainPersistence } from './localBrainPersistence'
export { remoteBrainPersistence } from './remoteBrainPersistence'
