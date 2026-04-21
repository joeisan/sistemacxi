import type { Metadata } from 'next'
import { ClientProviders } from '@/components/providers/client-providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Casilleros',
  description: 'Plataforma administrativa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head />
      <body suppressHydrationWarning className="font-sans min-h-full flex flex-col items-stretch">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
