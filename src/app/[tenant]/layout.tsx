import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { FontSizeProvider } from '@/components/providers/font-size-provider'
import { TrialExpiredForm } from '@/components/tenant/trial-expired-form'

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

  // --- TRIAL GUARD ---
  const isExpired = tenantData.is_trial && 
                    tenantData.trial_ends_at && 
                    new Date() > new Date(tenantData.trial_ends_at)

  // Inject the branding colors into the CSS variables.
  const styleVariables = {
    '--primary': tenantData.primary_color || '#2563eb',
    '--secondary': tenantData.secondary_color || '#f97316',
    '--accent': tenantData.accent_color || '#0f172a',
  } as React.CSSProperties

  if (isExpired) {
    return (
      <div style={styleVariables} className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md w-full space-y-8 p-12 bg-card rounded-3xl border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Prueba Terminada</h1>
            <p className="text-muted-foreground leading-relaxed">
              Tu período de prueba de 24 horas ha finalizado. Esperamos que hayas podido explorar el potencial de **{tenantData.name}**.
            </p>
          </div>
          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-sm font-bold text-primary mb-4 italic">¿Deseas seguir usando nuestros servicios?</p>
            <p className="text-xs text-muted-foreground mb-6">Déjanos tus datos y te contactaremos para activar tu portal definitivo.</p>
            
            <TrialExpiredForm tenantId={tenantData.id} />
          </div>
          <p className="text-[10px] text-muted-foreground">© 2026 LogiStream SaaS Platform</p>
        </div>
      </div>
    )
  }

  return (
    <FontSizeProvider>
      <div style={styleVariables} className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
        {/* We can provide a TenantContext here if we need tenant data in client components */}
        {children}
      </div>
    </FontSizeProvider>
  )
}
