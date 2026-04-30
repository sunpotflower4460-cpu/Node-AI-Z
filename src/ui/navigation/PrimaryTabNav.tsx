import type { PrimaryTabId } from './tabUiTypes'
import { PRIMARY_TABS } from './tabDisplayConfig'
import { MobileTabScroller } from './MobileTabScroller'

type PrimaryTabNavProps = {
  activeTab: PrimaryTabId
  researchMode: boolean
  onTabChange: (id: PrimaryTabId) => void
}

export const PrimaryTabNav = ({
  activeTab,
  researchMode,
  onTabChange,
}: PrimaryTabNavProps) => (
  <div className="scrollbar-hide sticky top-2 z-10 -mx-1 bg-[#F8FAFC] px-1 pb-2 pt-1 md:top-[84px]">
    <MobileTabScroller
      tabs={PRIMARY_TABS}
      activeTab={activeTab}
      researchMode={researchMode}
      onTabChange={onTabChange}
    />
  </div>
)
