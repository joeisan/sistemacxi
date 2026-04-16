'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted, we still render the children to avoid hydration mismatch
  // but next-themes will handle the script injection.
  // The script tag warning is often unavoidable in dev with some next-themes versions
  // but let's ensure it's as clean as possible.
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
