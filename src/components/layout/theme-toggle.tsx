'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="shrink-0">
        <span className="sr-only">Cargando tema</span>
        <Sun className="h-5 w-5 opacity-50" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    // Force a specific theme instead of relying solely on 'system' resolution during the transition
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="shrink-0 hover:bg-muted transition-colors"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Moon className="h-5 w-5 text-primary rotate-0 scale-100 transition-all" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500 rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
