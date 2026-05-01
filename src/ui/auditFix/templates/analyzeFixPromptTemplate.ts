export const analyzeFixPromptTemplate = `# Task
Improve the Analyze Flow clarity of Node-AI-Z.

# Scope
- Analyze flow states: before / analyzing / completed / error
- AnalyzeResultSummary
- PostAnalyzeNextActions (navigation to result tabs)
- PipelineStepIndicator

# Do
- Show a clear before-state explaining what Analyze will do
- Show progress during analyzing with step indicators
- Show a concise result summary after completion
- Show next-tab navigation links after completion
- Show a clear error state with retry action on failure

# Do Not
- Do not modify the underlying pipeline or signal logic
- Do not change Home tab layout
- Do not auto-navigate to tabs — only show suggestions
- Do not merge or submit PRs automatically

# Files likely involved
- src/ui/analyze/AnalyzeFlowCard.tsx
- src/ui/analyze/AnalyzeResultSummary.tsx
- src/ui/analyze/PostAnalyzeNextActions.tsx
- src/ui/analyze/PipelineStepIndicator.tsx
- src/ui/analyze/AnalyzeProgressPanel.tsx
- src/ui/analyze/AnalyzeErrorState.tsx

# Acceptance Criteria
- Each of the 4 states (before / analyzing / completed / error) renders distinctly
- Result summary shows key metrics after completion
- Next-tab buttons are visible after completion
- Error state shows a retry button
- No pipeline logic is modified

# Final Report Format
List every file changed, what was changed, and confirm all acceptance criteria pass.
`
