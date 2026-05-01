export const tabFixPromptTemplate = `# Task
Improve the Tab / Navigation clarity of Node-AI-Z.

# Scope
- Primary tab navigation
- Tab labels and icons
- Per-tab empty states
- Tab roles: 概要 / 発火 / 成長 / 先生 / 検証 / リスク / 履歴 / Mother

# Do
- Ensure each tab has a clear one-line purpose label
- Ensure each tab has a proper EmptyState when data is unavailable
- Keep tab labels short (max 4 characters for Japanese labels)
- Ensure the active tab is visually distinct
- Mobile: ensure tab bar is scrollable and all tabs are accessible

# Do Not
- Do not change the tab order without explicit approval
- Do not merge Mother tab into other tabs
- Do not remove any existing tab
- Do not modify signal or node logic

# Files likely involved
- src/ui/navigation/PrimaryTabNav.tsx
- src/ui/navigation/MobileTabScroller.tsx
- src/ui/navigation/tabDisplayConfig.ts
- src/ui/shared/TabEmptyState.tsx
- src/ui/tabs/GrowthTab.tsx
- src/ui/tabs/RiskTab.tsx
- src/ui/tabs/MotherTab.tsx

# Acceptance Criteria
- Each tab shows a purpose label visible without opening the tab
- Each tab renders an EmptyState when no data is available
- Tab bar is horizontally scrollable on mobile
- Active tab indicator is visible
- No tab is removed or reordered

# Final Report Format
List every file changed, what was changed, and confirm all acceptance criteria pass.
`
