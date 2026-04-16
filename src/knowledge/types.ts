/** A single entry in the info layer */
export type InfoEntry = {
  /** Unique key identifying this entry (may match a signal id or label) */
  key: string
  /** Human-readable content of this info entry */
  content: string
  /** Relevance score at time of creation (0.0–1.0) */
  relevance: number
  /** ISO timestamp of last access */
  lastUsed: string
  /** Number of times this entry has been accessed */
  useCount: number
}

/** The info layer: a lightweight, optional knowledge surface */
export type InfoLayer = {
  entries: InfoEntry[]
  /** ISO timestamp of last mutation */
  lastUpdated: string
}
