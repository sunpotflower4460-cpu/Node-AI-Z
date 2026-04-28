import type { ReactNode } from 'react'

type ResponsivePageContainerProps = {
  children: ReactNode
  className?: string
}

export const ResponsivePageContainer = ({ children, className = '' }: ResponsivePageContainerProps) => (
  <div
    className={`mx-auto w-full max-w-[1080px] px-3 py-4 sm:px-4 md:px-6 ${className}`}
  >
    {children}
  </div>
)
