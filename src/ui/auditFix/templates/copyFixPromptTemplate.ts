export const copyFixPromptTemplate = `# Task
Improve UI copy clarity in Node-AI-Z.

# Scope
- Japanese UI labels
- Risk and Mother export descriptions
- Overly technical or academic expressions in Simple View
- Empty state messages

# Do
- Simplify Japanese labels to everyday language in Simple View
- Replace Risk score descriptions with plain observation language (e.g. "注意サイン" instead of "危険度スコア")
- Replace Mother export copy with honest, non-overpromising language
- Keep Research View labels unchanged — only change Simple View copy
- Ensure empty state messages explain what will appear when data is available

# Do Not
- Do not change variable names or code identifiers
- Do not modify English labels used in Research View
- Do not change risk computation logic
- Do not remove any labels — only reword them

# Files likely involved
- src/ui/copy/riskCopy.ts
- src/ui/copy/uiLabelMap.ts
- src/ui/copy/emptyStateCopy.ts
- src/ui/copy/onboardingCopy.ts
- src/ui/copy/engineCopy.ts
- src/ui/copy/tabCopy.ts

# Acceptance Criteria
- Simple View shows everyday Japanese for all key labels
- Risk section does not use alarming or overpromising language
- Mother export copy is honest about its experimental nature
- Empty states explain expected content
- Research View labels are unchanged

# Final Report Format
List every file changed, what was changed, and confirm all acceptance criteria pass.
`
