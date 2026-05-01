export const settingsFixPromptTemplate = `# Task
Improve Settings clarity and organization in Node-AI-Z.

# Scope
- Settings sections: 基本設定 / 脳エンジン / 表示 / 研究・開発 / 保存 / 危険操作
- ResearchSettingsSection placement
- DangerZone visual separation

# Do
- Move Research / Development settings behind a collapsed section (default closed)
- Visually separate DangerZone with a red border or warning header
- Keep basic settings (engine, display, storage) prominent and accessible
- Add a brief description to each settings section header
- Ensure dangerous operations (reset, delete) require confirmation

# Do Not
- Do not remove any existing settings
- Do not change the underlying settings logic or state management
- Do not expose Research settings in Simple View mode
- Do not modify engine computation settings behavior

# Files likely involved
- src/ui/settings/SettingsPanel.tsx
- src/ui/settings/ResearchSettingsSection.tsx
- src/ui/settings/DangerZone.tsx
- src/ui/settings/SettingSectionHeader.tsx
- src/ui/settings/BasicSettingsSection.tsx
- src/ui/layout/CollapsibleSection.tsx

# Acceptance Criteria
- Research / Development section is collapsed by default
- DangerZone has a distinct visual warning style
- Each section has a one-line description
- Dangerous operations show a confirmation step
- Settings work identically after visual reorganization

# Final Report Format
List every file changed, what was changed, and confirm all acceptance criteria pass.
`
