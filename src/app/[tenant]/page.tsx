import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LoginForm } from '@/components/tenant/login-form'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TenantLoginPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return null

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-muted/20">
      {/* Decorative Blob backgrounds */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-secondary/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 p-4 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          {tenantData.logo_url ? (
            <img 
              src={tenantData.logo_url} 
              alt={`Logo de ${tenantData.name}`} 
              className="h-20 w-auto object-contain drop-shadow-sm"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-heading font-bold shadow-lg shadow-primary/20">
              {tenantData.name.charAt(0)}
            </div>
          )}
        </div>

        <Card className="border shadow-xl bg-background/80 backdrop-blur-xl border-white/20 dark:border-white/10">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-heading font-bold tracking-tight text-foreground">
              {tenantData.login_title || `Bienvenido a ${tenantData.name}`}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/80">
              Ingresa a tu casillero internacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            <LoginForm tenantSlug={tenant} />

            <div className="mt-8 text-center text-sm text-muted-foreground">
              ¿No tienes casillero?{' '}
              <Link href="/registro" className="font-semibold text-primary hover:text-primary/80 transition-colors ml-1">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
