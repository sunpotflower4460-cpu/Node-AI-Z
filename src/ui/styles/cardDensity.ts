/**
 * Card density tokens.
 * Use these to ensure consistent spacing and border radius across card variants.
 */
export const CARD_DENSITY = {
  /** Full-width hero card for the most important content */
  hero: {
    padding: 'p-4',
    radius: 'rounded-2xl',
  },
  /** Standard compact card */
  compact: {
    padding: 'p-3',
    radius: 'rounded-xl',
  },
  /** Minimal row-style card */
  row: {
    padding: 'px-3 py-2',
    radius: 'rounded-lg',
  },
} as const

export type CardDensityKey = keyof typeof CARD_DENSITY
