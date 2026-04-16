import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, Clock, ShieldAlert, Bell, TrendingUp } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { DashboardAlert } from '@/components/tenant/dashboard-alert'

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const supabase = createAdminClient()

  // 1. Fetch Stats & Plan Data
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantData.id)

  const { count: packagesCount } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantData.id)

  const { count: activePackagesCount } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantData.id)
    .neq('status', 'entregado')

  // 2. Fetch Alerts (from Super Admin)
  const { data: tenantAlerts } = await supabase
    .from('tenant_alerts')
    .select('*')
    .eq('tenant_id', tenantData.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  // 3. Fetch recent clients
  const { data: recentClients } = await supabase
    .from('clients')
    .select('full_name, client_code, created_at')
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Plan Expiry Logic (4 days before)
  const daysUntilExpiry = tenantData.plan_expiry_date 
    ? Math.ceil((new Date(tenantData.plan_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 4 && daysUntilExpiry >= 0

  return (
    <div className="flex flex-col gap-6 max-w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">Resumen de {tenantData.name}</p>
      </div>

      {/* --- ALERTAS INTELIGENTES --- */}
      <div className="flex flex-col gap-4">
        {isExpiringSoon && (
          <DashboardAlert 
            id={`system-expiry-${tenantData.id}`}
            type="error"
            message="¡Tu plan expirará muy pronto! Por favor contacta a soporte corporativo para la renovación."
            planExpiryDate={tenantData.plan_expiry_date}
            tenantId={tenantData.id}
          />
        )}

        {tenantAlerts && tenantAlerts.map((alert: any) => (
          <DashboardAlert 
            key={alert.id}
            id={alert.id}
            type={alert.type}
            message={alert.message}
            planExpiryDate={tenantData.plan_expiry_date}
            tenantId={tenantData.id}
          />
        ))}
      </div>

      {/* --- FILA 1: ESTADÍSTICAS --- */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Total Clientes
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="hero-number text-blue-500">{clientsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Paquetes Totales
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Package className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="hero-number text-emerald-500">{packagesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico total</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Activos
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="hero-number text-amber-500">{activePackagesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendientes de entrega</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Reportes
            </CardTitle>
            <div className="rounded-lg bg-rose-500/10 p-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="hero-number text-rose-500">0</div>
            <p className="text-xs text-muted-foreground mt-1">Sin incidencias</p>
          </CardContent>
        </Card>
      </div>

      {/* --- FILA 2: ÚLTIMOS CLIENTES Y NOTIFICACIONES (tamaño natural) --- */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="p-5 pb-3 border-b">
            <CardTitle className="text-sm uppercase font-bold tracking-widest flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              Últimos Clientes Registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {recentClients && recentClients.length > 0 ? (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div key={client.client_code} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {client.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{client.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">
                      {client.client_code}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground italic">Ningún cliente registrado aún</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-5 pb-3 border-b">
            <CardTitle className="text-sm uppercase font-bold tracking-widest flex items-center gap-2 text-muted-foreground">
              <Bell className="h-4 w-4 text-primary" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin alertas pendientes</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Las notificaciones del sistema aparecerán aquí</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
