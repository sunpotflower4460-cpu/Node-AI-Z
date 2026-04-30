import type { PrimaryTabId } from './tabUiTypes'
import type { PrimaryTab } from './tabUiTypes'

type MobileTabScrollerProps = {
  tabs: PrimaryTab[]
  activeTab: PrimaryTabId
  researchMode: boolean
  onTabChange: (id: PrimaryTabId) => void
}

export const MobileTabScroller = ({
  tabs,
  activeTab,
  researchMode,
  onTabChange,
}: MobileTabScrollerProps) => (
  <div className="relative">
    <div
      className="scrollbar-hide flex gap-1 overflow-x-auto px-1 pb-1"
      role="tablist"
      aria-label="プライマリータブ"
    >
      {/* left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#F8FAFC] to-transparent" aria-hidden="true" />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const label = researchMode ? tab.researchLabel : tab.label
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`tap-target flex shrink-0 items-center whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150 ${
              isActive
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
            }`}
          >
            {label}
            {isActive ? <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" /> : null}
          </button>
        )
      })}
      {/* right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#F8FAFC] to-transparent" aria-hidden="true" />
    </div>
  </div>
)
