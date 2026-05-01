import { useState } from 'react'

type Props = {
  prompt: string
  label?: string
}

export const CopyFixPromptButton = ({ prompt, label = '指示書をコピー' }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 min-h-[36px]"
      aria-label={label}
    >
      {copied ? 'コピーしました ✓' : label}
    </button>
  )
}
