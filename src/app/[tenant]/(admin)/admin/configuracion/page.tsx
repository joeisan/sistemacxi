import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressManager } from '@/components/tenant/address-manager'
import { SequenceManager } from '@/components/tenant/sequence-manager'
import { CourierManager } from '@/components/tenant/courier-manager'
import { BrandingManager } from '@/components/tenant/branding-manager'
import { ShareLinkCard } from '@/components/tenant/share-link-card'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'

export default async function AdminConfiguracionPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const supabase = createAdminClient()

  // 1. Fetch current addresses
  const { data: addresses } = await supabase
    .from('tenant_addresses')
    .select('*')
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: true })

  // 2. Fetch current sequence settings
  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('current_sequence, client_code_prefix, client_code_suffix')
    .eq('tenant_id', tenantData.id)
    .single()

  // 3. Fetch couriers
  const { data: couriers } = await supabase
    .from('couriers')
    .select('*')
    .eq('tenant_id', tenantData.id)
    .order('name', { ascending: true })

  const isReadOnly = !tenantData.is_active || isTenantExpired(tenantData)

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground text-lg">Configura los parámetros fundamentales de tu logística y marca.</p>
      </div>

      <div className="grid gap-8">
        {/* --- SHARE LINK SECTION --- */}
        <ShareLinkCard subdomain={tenantData.subdomain} />

        {/* --- BRANDING & BASIC INFO --- */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Identidad Corporativa</CardTitle>
                <CardDescription>
                    Define el nombre comercial y visualiza los colores de tu plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BrandingManager 
                    tenantId={tenantData.id}
                    initialName={tenantData.name}
                    primaryColor={tenantData.primary_color || '#000000'}
                    secondaryColor={tenantData.secondary_color || '#ffffff'}
                    isReadOnly={isReadOnly}
                />
            </CardContent>
        </Card>

        {/* --- SEQUENCES & CODES --- */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
                <CardTitle className="text-xl font-bold font-mono">Configuración de Códigos (Casilleros)</CardTitle>
                <CardDescription>
                    Personaliza el formato de los códigos que se asignan a tus nuevos clientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SequenceManager 
                    tenantId={tenantData.id} 
                    currentSequence={settings?.current_sequence || 0} 
                    prefix={settings?.client_code_prefix || 'BOX'}
                    suffix={settings?.client_code_suffix || ''}
                    isReadOnly={isReadOnly}
                />
            </CardContent>
        </Card>

        {/* --- WAREHOUSE ADDRESSES --- */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Direcciones de Recepción (Bodegas/Hubs)</CardTitle>
            <CardDescription>
              Añade las direcciones físicas donde tus clientes deben enviar sus paquetes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressManager 
                tenantId={tenantData.id} 
                initialAddresses={addresses || []} 
                isReadOnly={isReadOnly}
            />
          </CardContent>
        </Card>

        {/* --- COURIER MANAGEMENT --- */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Transportadoras Locales / Couriers</CardTitle>
            <CardDescription>
              Gestiona los proveedores de envío que utilizas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourierManager tenantId={tenantData.id} initialCouriers={couriers || []} isReadOnly={isReadOnly} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
