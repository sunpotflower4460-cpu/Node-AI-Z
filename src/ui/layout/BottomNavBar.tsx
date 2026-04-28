import type { ReactNode } from 'react'

export type NavTab = {
  id: string
  label: string
  icon?: ReactNode
}

type BottomNavBarProps = {
  tabs: NavTab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export const BottomNavBar = ({ tabs, activeTab, onTabChange }: BottomNavBarProps) => {
  const primaryTabs = tabs.slice(0, 5)
  const moreTabs = tabs.slice(5)

  return (
    <nav
      className="safe-area-pb fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm lg:hidden"
      aria-label="モバイルナビゲーション"
    >
      <div className="flex items-stretch">
        {primaryTabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={isActive}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon ? <span className="h-5 w-5">{tab.icon}</span> : null}
              <span className="truncate">{tab.label}</span>
              {isActive ? (
                <span className="h-0.5 w-4 rounded-full bg-cyan-400" />
              ) : null}
            </button>
          )
        })}
        {moreTabs.length > 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2.5">
            <span className="text-[10px] font-semibold text-slate-500">More</span>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
