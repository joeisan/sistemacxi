'use client'

import React from 'react'
import { useFontSize } from '../providers/font-size-provider'
import { Button } from '@/components/ui/button'

export function FontSizeSelector() {
  const { fontSize, setFontSize } = useFontSize()

  const sizes: ('S' | 'M' | 'L' | 'XL')[] = ['S', 'M', 'L', 'XL']

  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
      {sizes.map((size) => (
        <Button
          key={size}
          variant={fontSize === size ? 'default' : 'ghost'}
          size="icon"
          title={`Tamaño ${size}`}
          className={`h-7 w-7 text-[10px] font-bold ${
            fontSize === size ? 'shadow-sm' : 'text-muted-foreground'
          }`}
          onClick={() => setFontSize(size)}
        >
          {size}
        </Button>
      ))}
    </div>
  )
}
