import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { EditTenantForm } from '@/components/super-admin/edit-tenant-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Package, Shield, Zap } from 'lucide-react'
import { isTenantExpired, getEffectiveExpiryDate } from '@/lib/utils/tenant-helpers'

export const dynamic = 'force-dynamic'

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tenant) {
    return notFound()
  }

  // Fetch stats for this tenant
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', id)

  const { count: packagesCount } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', id)

  const isExpired = isTenantExpired(tenant)
  const effectiveExpiry = getEffectiveExpiryDate(tenant)
  
  const daysUntilExpiry = effectiveExpiry 
    ? Math.ceil((new Date(effectiveExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Empresa</h1>
        <p className="text-muted-foreground">Actualiza la suscripción y configuración de {tenant.name}.</p>
      </div>

      {/* --- STATUS OVERVIEW --- */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-2">
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider w-fit">
              {tenant.plan_type || 'Básico'}
            </Badge>
            {tenant.is_trial && (
              <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-tighter w-fit h-5 px-1.5 flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 fill-current" /> Modo Prueba
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm ${isExpired ? 'bg-destructive/5' : isExpiringSoon ? 'bg-amber-500/5' : ''}`}>
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Expiración
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {effectiveExpiry ? (
              <div className="flex flex-col gap-1">
                <span className={`text-sm font-bold ${isExpired ? 'text-destructive' : isExpiringSoon ? 'text-amber-600' : ''}`}>
                  {new Date(effectiveExpiry).toLocaleDateString('es', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </span>
                <span className={`text-xs ${isExpired ? 'text-destructive' : isExpiringSoon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {isExpired 
                    ? `Expirado hace ${Math.abs(daysUntilExpiry!)} días`
                    : `${daysUntilExpiry} días restantes`
                  }
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Sin fecha</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-2xl font-black">{clientsCount || 0}</span>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Paquetes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-2xl font-black">{packagesCount || 0}</span>
          </CardContent>
        </Card>
      </div>

      <EditTenantForm tenant={tenant} />
    </div>
  )
}
