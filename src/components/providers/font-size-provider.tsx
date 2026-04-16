'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type FontSize = 'S' | 'M' | 'L' | 'XL'

interface FontSizeContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('M')

  const applySize = (size: FontSize) => {
    const mapping = {
      S: '14px',
      M: '16px',
      L: '18px',
      XL: '22px'
    }
    document.documentElement.style.fontSize = mapping[size]
  }

  useEffect(() => {
    const saved = localStorage.getItem('app-font-size') as FontSize
    if (saved && ['S', 'M', 'L', 'XL'].includes(saved)) {
      setFontSizeState(saved)
      applySize(saved)
    }
  }, [])

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    localStorage.setItem('app-font-size', size)
    applySize(size)
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => {
  const context = useContext(FontSizeContext)
  if (!context) throw new Error('useFontSize must be used within FontSizeProvider')
  return context
}
