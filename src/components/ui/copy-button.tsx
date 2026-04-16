'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function CopyButton({ value, className, size = "icon" }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      size={size}
      variant="ghost"
      className={cn(
        "h-8 w-8 px-0 transition-all hover:bg-muted focus-visible:ring-1",
        className
      )}
      onClick={copyToClipboard}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="sr-only">Copiar</span>
    </Button>
  )
}
