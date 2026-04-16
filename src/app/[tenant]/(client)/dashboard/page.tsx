import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Package, ArrowRight, CreditCard, Zap } from 'lucide-react'
import Link from 'next/link'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LockerAddressCard } from '@/components/tenant/locker-address-card'
import { DashboardAlert } from '@/components/tenant/dashboard-alert'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientDashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // Fetch client and financial summary (Refined with tenant filter and name)
  const { data: clientInfo } = await supabase
    .from('clients')
    .select('id, full_name, client_code, plan_id, pricing_plans(name, cost_per_lb, delivery_fee)')
    .eq('profile_id', user.id)
    .eq('tenant_id', tenantData.id)
    .single()

  // Fetch totals
  const { data: packages } = await supabase
    .from('packages')
    .select('total_amount, payment_status, status, client_id, tenant_id')
    .eq('client_id', clientInfo?.id || '00000000-0000-0000-0000-000000000000')
    .eq('tenant_id', tenantData.id)

  const pendingBalance = packages?.reduce((acc, p) => 
    p.payment_status === 'pending' ? acc + (p.total_amount || 0) : acc, 0) || 0
  
  const activePackages = packages?.filter(p => p.status !== 'entregado').length || 0

  // Handle name for welcome
  const firstName = clientInfo?.full_name?.split(' ')[0] || 'Cliente'

  // ... (rest of the fetching stays same)

  // Fetch alerts for this tenant
  const { data: tenantAlerts } = await supabase
    .from('tenant_alerts')
    .select('*')
    .eq('tenant_id', tenantData.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  // Fetch addresses for this tenant
  const { data: hubs } = await supabase
    .from('tenant_addresses')
    .select('*')
    .eq('tenant_id', tenantData.id)
    .order('is_default', { ascending: false })

  // Fallback
  const fallbackHubs = !hubs || hubs.length === 0 ? [{
    label: 'Dirección Principal',
    address_line_1: '6315 NW 99TH AVE',
    city_state_zip: 'DORAL, FL 33178',
    country: 'United States',
    phone: '+1 7866185090'
  }] : hubs

  const rawPlan = (clientInfo as any)?.pricing_plans
  const planInfo = Array.isArray(rawPlan) ? rawPlan[0] : (rawPlan || null)

  return (
    <div className="flex flex-col gap-6">
      {/* Alertas dinámicas */}
      <div className="flex flex-col gap-3">
        {tenantAlerts && tenantAlerts.map((alert: any) => (
          <DashboardAlert 
            key={alert.id}
            id={alert.id}
            type={alert.type}
            message={alert.message}
            tenantId={tenantData.id}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hola, {firstName}</h1>
        <p className="text-muted-foreground">Bienvenido a tu casillero. Usa estas direcciones para tus compras.</p>
      </div>

      <LockerAddressCard 
        hubs={fallbackHubs as any} 
        clientCode={clientInfo?.client_code || '---'} 
        enterpriseName={tenantData.name} 
      />

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="hover:border-primary/50 transition-colors bg-card shadow-sm border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Pendiente
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="hero-number text-primary">${pendingBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Paquetes por pagar.
            </p>
            <Button size="sm" className="mt-4 w-full" asChild>
              <Link href="/dashboard/finanzas">
                Ver detalle <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mis Paquetes
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="hero-number text-foreground">{activePackages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Paquetes activos en tránsito.
            </p>
            <Button size="sm" variant="secondary" className="mt-4 w-full" asChild>
              <Link href="/dashboard/paquetes">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rastrear Envío
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-mono">17TRACK</div>
            <p className="text-xs text-muted-foreground mt-1">
              Servicio de rastreo externo.
            </p>
            <Button size="sm" variant="ghost" className="mt-4 w-full" asChild>
              <Link href="/dashboard/rastrear">
                Ir a rastreo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
