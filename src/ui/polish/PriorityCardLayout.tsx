import type { ReactNode } from 'react'

/**
 * PriorityCardLayout — arranges cards by priority level.
 *
 * Priority 1 (hero): Always visible at top — CurrentStatusBar, AnalyzeFlowCard, CurrentSummaryCard
 * Priority 2 (main): Overview tab — DevelopmentStageCard, RiskSummaryCard, NextActionCard
 * Priority 3 (detail): Tab-specific metrics — Growth, Teacher, CompactMetricStrip
 * Priority 4 (research): accordion / Research View only — raw IDs, debug traces
 */
type PriorityCardLayoutProps = {
  /** Priority 1: Always rendered first */
  heroSlot?: ReactNode
  /** Priority 2: Main overview content */
  mainSlot?: ReactNode
  /** Priority 3: Detail / tab content */
  detailSlot?: ReactNode
  /** Priority 4: Research View only. Rendered when showResearch is true */
  researchSlot?: ReactNode
  showResearch?: boolean
}

export const PriorityCardLayout = ({
  heroSlot,
  mainSlot,
  detailSlot,
  researchSlot,
  showResearch = false,
}: PriorityCardLayoutProps) => (
  <div className="flex flex-col gap-4">
    {heroSlot ? <div>{heroSlot}</div> : null}
    {mainSlot ? <div className="flex flex-col gap-4">{mainSlot}</div> : null}
    {detailSlot ? <div className="flex flex-col gap-3">{detailSlot}</div> : null}
    {showResearch && researchSlot ? (
      <div className="flex flex-col gap-3">{researchSlot}</div>
    ) : null}
  </div>
)
