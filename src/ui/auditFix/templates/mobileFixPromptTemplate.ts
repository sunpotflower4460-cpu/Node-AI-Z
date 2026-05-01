export const mobileFixPromptTemplate = `# Task
Improve mobile readability and usability in Node-AI-Z.

# Scope
- Touch target sizes
- Sticky header / bottom nav overlap issues
- Card density on small screens
- Tab bar horizontal scroll
- Font sizes and line heights for mobile

# Do
- Ensure all primary buttons have a touch target of at least 44px
- Ensure secondary buttons have a touch target of at least 36px
- Prevent sticky bars from overlapping scrollable content (add appropriate padding)
- Reduce card density on mobile: prefer single-column layout
- Ensure tab bar is horizontally scrollable on small screens
- Use minimum 14px font size for body text on mobile

# Do Not
- Do not change desktop layout
- Do not remove functionality to reduce density — only reorder or collapse
- Do not modify signal computation logic
- Do not change tab content — only adjust layout and spacing

# Files likely involved
- src/ui/layout/MobileShell.tsx
- src/ui/layout/BottomNavBar.tsx
- src/ui/layout/StickySummaryBar.tsx
- src/ui/mobile/MobileCardStack.tsx
- src/ui/navigation/MobileTabScroller.tsx
- src/ui/shared/TouchTargetButton.tsx
- src/ui/styles/mobileSpacing.ts

# Acceptance Criteria
- All primary action buttons are >= 44px tap target
- No content is hidden behind sticky headers or bottom nav
- Card layout is single-column on screens < 640px
- Tab navigation is reachable by horizontal scroll on mobile
- Body text is >= 14px on mobile

# Final Report Format
List every file changed, what was changed, and confirm all acceptance criteria pass.
`
