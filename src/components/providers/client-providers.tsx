"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { FontSizeProvider } from "./font-size-provider"

// --- PATCH PARA REACT 19 / NEXT.JS 15 ---
// Silenciamos el aviso "Encountered a script tag" que es un falso positivo de next-themes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    const origError = console.error;
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
        return;
      }
      origError.apply(console, args);
    };
  }
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Usamos suppressHydrationWarning en un contenedor de nivel superior
  // para ayudar a mitigar el aviso original de React.
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FontSizeProvider>
        <div suppressHydrationWarning className="contents">
          {children}
          <Toaster />
        </div>
      </FontSizeProvider>
    </NextThemesProvider>
  )
}
