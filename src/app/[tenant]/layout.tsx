import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams

  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) {
    notFound()
  }

  // Inject the branding colors into the CSS variables.
  const styleVariables = {
    '--primary': tenantData.primary_color || '#2563eb',
    '--secondary': tenantData.secondary_color || '#f97316',
    '--accent': tenantData.accent_color || '#0f172a',
  } as React.CSSProperties

  return (
    <div suppressHydrationWarning style={styleVariables} className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
      {/* We can provide a TenantContext here if we need tenant data in client components */}
      {children}
    </div>
  )
}
