import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Package, Truck, Terminal } from 'lucide-react'
import { CreatePlanDialog } from '@/components/tenant/create-plan-dialog'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'

export default async function AdminPlanesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const supabase = createAdminClient()

  // Fetch plans for this tenant
  const { data: plans, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching plans:', error)

  const uniqueDeliveryFees = Array.from(new Set(plans?.map(p => p.delivery_fee) || []))
    .sort((a, b) => b - a)
    .slice(0, 3)

  const columns: ColumnDef<any>[] = [
    {
      header: 'Nombre del Plan',
      accessorKey: 'name',
      className: 'font-bold text-sm tracking-tight',
      priority: true
    },
    {
      header: 'Costo x Libra',
      render: (p) => (
        <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
          ${p.cost_per_lb.toFixed(2)}
        </span>
      ),
      className: 'text-center'
    },
    {
      header: 'Cargo Delivery',
      render: (p) => (
        <span className="font-mono text-xs font-black text-amber-600 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">
          ${p.delivery_fee.toFixed(2)}
        </span>
      ),
      className: 'text-center'
    },
    {
      header: '¿Por Defecto?',
      render: (p) => (
        p.is_default ? (
          <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[9px] font-black uppercase px-2 h-5">
            PRINCIPAL
          </Badge>
        ) : <span className="text-muted-foreground/30">—</span>
      ),
      className: 'text-center'
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-amber-500/10 items-center justify-center text-amber-600 shadow-inner">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Planes de Cobro</h1>
            <p className="text-xs font-medium text-muted-foreground">Configuración de tarifas comerciales para envíos.</p>
          </div>
        </div>
        <CreatePlanDialog tenantId={tenantData.id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-primary/10 shadow-sm bg-gradient-to-br from-primary/[0.03] to-transparent overflow-hidden">
          <CardHeader className="pb-2 border-b border-primary/5 bg-primary/5">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              Catálogo de Planes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-black tracking-tighter text-foreground">{plans?.length || 0}</div>
            <p className="text-sm font-bold text-muted-foreground opacity-70 uppercase tracking-tighter mt-1">Estructuras de precio activas</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-amber-500/10 shadow-sm bg-gradient-to-br from-amber-500/[0.03] to-transparent overflow-hidden">
          <CardHeader className="pb-2 border-b border-amber-500/5 bg-amber-500/5">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
              <Truck className="h-3.5 w-3.5" />
              Distribución Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {uniqueDeliveryFees.length > 0 ? (
                uniqueDeliveryFees.map((fee, i) => (
                  <div key={i} className="text-lg font-black px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700">
                    ${fee.toFixed(2)}
                  </div>
                ))
              ) : (
                <div className="text-lg font-black text-muted-foreground">$0.00</div>
              )}
            </div>
            <p className="text-sm font-bold text-muted-foreground opacity-70 uppercase tracking-tighter mt-2">Tasas únicas de entrega</p>
          </CardContent>
        </Card>
      </div>

      <DataTableResponsive
        data={plans || []}
        columns={columns}
        rowId={(p) => p.id}
        mobileConfig={{
          title: (p) => p.name,
          subtitle: (p) => `$${p.cost_per_lb.toFixed(2)} x lb`,
          badge: (p) => p.is_default && (
            <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[8px] h-4">
              PRINCIPAL
            </Badge>
          )
        }}
        actions={(p) => (
          <CreatePlanDialog tenantId={tenantData.id} plan={p} />
        )}
      />
    </div>
  )
}
