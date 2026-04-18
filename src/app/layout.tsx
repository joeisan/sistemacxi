import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { ClientProviders } from '@/components/providers/client-providers'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
})

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
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
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
