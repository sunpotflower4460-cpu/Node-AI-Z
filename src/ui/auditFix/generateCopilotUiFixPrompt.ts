import type { UiFixCandidate, UiFixCategory } from './uiAuditFixTypes'
import { homeFixPromptTemplate } from './templates/homeFixPromptTemplate'
import { analyzeFixPromptTemplate } from './templates/analyzeFixPromptTemplate'
import { tabFixPromptTemplate } from './templates/tabFixPromptTemplate'
import { settingsFixPromptTemplate } from './templates/settingsFixPromptTemplate'
import { copyFixPromptTemplate } from './templates/copyFixPromptTemplate'
import { mobileFixPromptTemplate } from './templates/mobileFixPromptTemplate'

type PrGroupInfo = {
  id: string
  title: string
  summary: string
  branchName: string
  categories: UiFixCategory[]
}

const TEMPLATE_FOR_CATEGORY: Record<UiFixCategory, string> = {
  first_screen: homeFixPromptTemplate,
  analyze_flow: analyzeFixPromptTemplate,
  tab_structure: tabFixPromptTemplate,
  empty_state: tabFixPromptTemplate,
  settings_clarity: settingsFixPromptTemplate,
  research_overexposure: settingsFixPromptTemplate,
  copy_clarity: copyFixPromptTemplate,
  risk_wording: copyFixPromptTemplate,
  mother_wording: copyFixPromptTemplate,
  mobile_readability: mobileFixPromptTemplate,
}

const buildCandidateSection = (candidates: UiFixCandidate[]): string => {
  if (candidates.length === 0) return ''
  const lines = candidates.map((c) =>
    `- [${c.priority.toUpperCase()}] ${c.title}\n  Problem: ${c.problem}\n  Fix: ${c.recommendedFix}`,
  )
  return `\n# Specific Issues to Address\n${lines.join('\n')}\n`
}

const buildAcceptanceCriteriaSection = (candidates: UiFixCandidate[]): string => {
  const criteria = candidates.flatMap((c) => c.acceptanceCriteria)
  const unique = [...new Set(criteria)]
  if (unique.length === 0) return ''
  return `\n# Acceptance Criteria\n${unique.map((c) => `- ${c}`).join('\n')}\n`
}

const buildFilesSection = (candidates: UiFixCandidate[]): string => {
  const files = [...new Set(candidates.flatMap((c) => c.affectedFilesHint))]
  if (files.length === 0) return ''
  return `\n# Files likely involved\n${files.map((f) => `- ${f}`).join('\n')}\n`
}

const selectBaseTemplate = (categories: UiFixCategory[]): string => {
  const primary = categories[0]
  return TEMPLATE_FOR_CATEGORY[primary] ?? homeFixPromptTemplate
}

export const generateCopilotUiFixPrompt = (
  group: PrGroupInfo,
  candidates: UiFixCandidate[],
): string => {
  const base = selectBaseTemplate(group.categories)

  const header = `# Task\n${group.title}\n\n# Summary\n${group.summary}\n\n# Branch\n${group.branchName}\n`
  const issuesSection = buildCandidateSection(candidates)
  const filesSection = buildFilesSection(candidates)
  const criteriaSection = buildAcceptanceCriteriaSection(candidates)
  const doNotSection = `\n# Do Not\n- Do not automatically merge or create PRs\n- Do not modify internal signal or node computation logic\n- Do not make changes outside the scope described above\n`
  const reportSection = `\n# Final Report Format\nList every file changed, what was changed, and confirm all acceptance criteria pass.\n`

  return [header, issuesSection, filesSection, doNotSection, criteriaSection, reportSection, '\n---\n', base]
    .filter(Boolean)
    .join('\n')
}
