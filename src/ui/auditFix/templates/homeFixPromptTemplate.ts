export const homeFixPromptTemplate = `# Task
Improve the Home / First Screen clarity of Node-AI-Z.

# Scope
- Home tab initial view
- CurrentStatusBar
- AnalyzeFlowCard / FirstActionCard
- EmptyObservationState
- GrowthMetricCards (zero-value cards)
- Mobile-first layout

# Do
- Show EmptyObservationState as the primary card before any Analyze has been run
- Hide or collapse zero-value metric cards until data is available
- Ensure CurrentStatusBar is always visible at the top
- Ensure the primary action button (Analyze) is prominent and easy to tap
- Apply mobile-first sizing: minimum 44px touch targets, readable text at 14px+

# Do Not
- Do not modify internal signal logic or node computation
- Do not remove any existing data — only hide or collapse it
- Do not merge or submit PRs automatically
- Do not change Settings, Risk, or Growth tab layouts

# Files likely involved
- src/ui/overview/EmptyObservationState.tsx
- src/ui/overview/GrowthMetricCards.tsx
- src/ui/overview/FirstActionCard.tsx
- src/ui/analyze/AnalyzeFlowCard.tsx
- src/ui/layout/CurrentStatusBar.tsx
- src/ui/tabs/HomeTab.tsx

# Acceptance Criteria
- On first open (no Analyze run), only EmptyObservationState and the primary action card are visible
- Zero-value metric cards are hidden or collapsed before Analyze completes
- CurrentStatusBar is visible without scrolling
- Primary Analyze button has a touch target >= 44px
- No existing functionality is removed

# Final Report Format
List every file changed, what was changed, and confirm all acceptance criteria pass.
`
