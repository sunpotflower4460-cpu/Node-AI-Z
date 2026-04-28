import type { ReactNode } from 'react'
import { BottomNavBar, type NavTab } from './BottomNavBar'
import { TopModeHeader } from './TopModeHeader'

type MobileShellProps = {
  mode: string
  stage: string
  riskLevel?: 'low' | 'medium' | 'high'
  tabs: NavTab[]
  activeTab: string
  onTabChange: (id: string) => void
  children: ReactNode
}

export const MobileShell = ({
  mode,
  stage,
  riskLevel = 'low',
  tabs,
  activeTab,
  onTabChange,
  children,
}: MobileShellProps) => (
  <div className="flex min-h-screen flex-col bg-slate-950 lg:hidden">
    <TopModeHeader mode={mode} stage={stage} riskLevel={riskLevel} />
    <main className="flex-1 overflow-y-auto pb-20">
      {children}
    </main>
    <BottomNavBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
  </div>
)
