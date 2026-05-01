/**
 * Mobile spacing constants.
 * All touch targets and text sizes follow mobile-first accessibility guidelines.
 */
export const MOBILE_SPACING = {
  /** 主要ボタン: height >= 44px */
  touchTargetPrimary: 'min-h-[44px]',
  /** 小ボタン: height >= 36px */
  touchTargetSmall: 'min-h-[36px]',
  /** カード間の余白 */
  cardGap: 'gap-4',
  /** セクション間の余白 */
  sectionGap: 'gap-6',
} as const

export const MOBILE_TEXT = {
  /** 本文: 14px 以上 */
  body: 'text-sm',
  /** 補足: 12px 以上 */
  caption: 'text-xs',
  /** 見出し */
  heading: 'text-base font-semibold',
  /** タイトル */
  title: 'text-lg font-bold',
} as const
