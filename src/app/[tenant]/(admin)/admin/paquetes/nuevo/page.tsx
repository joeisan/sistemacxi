import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { RegisterPackageForm } from '@/components/tenant/register-package-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function NewPackagePage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const supabase = createAdminClient()

  // Fetch all clients for the selection list
  const { data: clients } = await supabase
    .from('clients')
    .select('id, client_code, full_name')
    .eq('tenant_id', tenantData.id)
    .order('full_name', { ascending: true })

  // Fetch couriers for the dropdown
  const { data: couriers } = await supabase
    .from('couriers')
    .select('id, name')
    .eq('tenant_id', tenantData.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Paquete</h1>
        <p className="text-muted-foreground">Registra la llegada de mercadería para un cliente.</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Envío</CardTitle>
            <CardDescription>
              Selecciona el cliente y los detalles del paquete recibido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterPackageForm 
                tenantId={tenantData.id} 
                clients={clients || []}
                couriers={couriers || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
