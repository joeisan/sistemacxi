import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { RegisterForm } from '@/components/tenant/register-form'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TenantRegistroPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {tenantData.logo_url ? (
            <img 
              src={tenantData.logo_url} 
              alt={`Logo de ${tenantData.name}`} 
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {tenantData.name.charAt(0)}
            </div>
          )}
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Crear Casillero
            </CardTitle>
            <CardDescription>
              Regístrate en {tenantData.name} para obtener tu dirección en Miami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm 
              tenantId={tenantData.id} 
              tenantName={tenantData.name} 
              tenantSlug={tenant}
            />
            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href={`/${tenant}`} className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
