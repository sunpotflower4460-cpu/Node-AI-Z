import { HelpPopover } from './HelpPopover'
import { findGlossaryEntry } from './buildGlossaryViewModel'

type TermHelpTextProps = {
  term: string
}

export const TermHelpText = ({ term }: TermHelpTextProps) => {
  const entry = findGlossaryEntry(term)
  if (!entry) return null

  return (
    <HelpPopover
      term={entry.term}
      definition={entry.definition}
      researchNote={entry.researchNote}
    />
  )
}
