import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Plus, Package2 } from 'lucide-react'
import Link from 'next/link'
import { StatusSelector } from '@/components/tenant/status-selector'
import { BillingDialog } from '@/components/tenant/billing-dialog'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'

export default async function AdminPaquetesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const isReadOnly = !tenantData.is_active || isTenantExpired(tenantData)
  const supabase = createAdminClient()

  // Fetch packages for this tenant
  const { data: packages, error } = await supabase
    .from('packages')
    .select(`
      id,
      tracking_number,
      courier_name,
      status,
      weight_lb,
      shipping_cost,
      total_amount,
      payment_status,
      created_at,
      clients (
        id,
        client_code,
        full_name,
        pricing_plans (
            cost_per_lb,
            delivery_fee
        )
      )
    `)
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: false })

  if (error) console.error('Error loading packages:', error)

  const columns: ColumnDef<any>[] = [
    {
      header: 'Fecha',
      render: (pkg) => (
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase opacity-80">
          {new Date(pkg.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Cliente',
      render: (pkg: any) => {
        const client = Array.isArray(pkg.clients) ? pkg.clients[0] : pkg.clients;
        return (
          <div className="flex flex-col min-w-[120px]">
            <span className="font-black text-primary text-[11px] tracking-tight">{client?.client_code}</span>
            <span className="text-[10px] text-muted-foreground font-bold truncate max-w-[150px]">{client?.full_name}</span>
          </div>
        );
      },
      priority: true
    },
    {
      header: 'Tracking #',
      render: (pkg) => (
        <span className="font-mono text-[11px] font-bold bg-muted/50 px-2 py-0.5 rounded border border-border/50 text-foreground">
          {pkg.tracking_number || 'N/A'}
        </span>
      ),
      priority: true
    },
    {
      header: 'Courier',
      accessorKey: 'courier_name',
      className: 'text-[11px] font-bold text-muted-foreground uppercase'
    },
    {
      header: 'Peso',
      render: (pkg) => (
        <Badge variant={pkg.weight_lb ? "default" : "outline"} className="font-mono text-[10px] h-5 px-2 bg-indigo-500/10 text-indigo-700 border-indigo-200">
          {pkg.weight_lb ? `${pkg.weight_lb} lb` : '-'}
        </Badge>
      ),
      className: 'text-center'
    },
    {
      header: 'Total',
      render: (pkg) => (
        <span className="font-mono font-black text-xs text-foreground bg-green-500/10 text-green-700 px-2 py-1 rounded-lg">
          {pkg.total_amount > 0 ? `$${pkg.total_amount.toFixed(2)}` : '-'}
        </span>
      ),
      className: 'text-center'
    },
    {
      header: 'Estado Sistema',
      render: (pkg) => (
        !isReadOnly ? (
          <StatusSelector packageId={pkg.id} currentStatus={pkg.status} />
        ) : (
          <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest bg-muted border-none p-1">
            {pkg.status.replace('_', ' ')}
          </Badge>
        )
      ),
      className: 'text-right'
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-indigo-500/10 items-center justify-center text-indigo-600 shadow-inner">
            <Package2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Paquetes</h1>
            <p className="text-xs font-medium text-muted-foreground">Flujo de entrada, inventario y facturación de envíos.</p>
          </div>
        </div>
        {!isReadOnly ? (
          <Button asChild className="shadow-lg shadow-primary/20 font-bold uppercase tracking-tight">
            <Link href="/admin/paquetes/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paquete
            </Link>
          </Button>
        ) : (
          <Badge variant="destructive" className="animate-pulse px-4 py-2 font-black uppercase text-[10px] border-none">
            {tenantData.is_active ? 'Lectura - Plan Expirado' : 'Lectura - Cuenta Suspendida'}
          </Badge>
        )}
      </div>

      <DataTableResponsive
        data={packages || []}
        columns={columns}
        rowId={(pkg) => pkg.id}
        mobileConfig={{
          title: (pkg: any) => pkg.tracking_number || 'S/N Tracking',
          subtitle: (pkg: any) => {
            const client = Array.isArray(pkg.clients) ? pkg.clients[0] : pkg.clients;
            return `${client?.client_code || ''} - ${client?.full_name || ''}`;
          },
          badge: (pkg: any) => (
            <Badge variant="outline" className="text-[8px] h-4 font-black uppercase tracking-widest border-indigo-200 text-indigo-700">
              {pkg.status.replace('_', ' ')}
            </Badge>
          )
        }}
        actions={(pkg: any) => {
          const client = Array.isArray(pkg.clients) ? pkg.clients[0] : pkg.clients;
          return !isReadOnly ? (
            <BillingDialog packageData={pkg} clientPlan={client?.pricing_plans} />
          ) : (
            <Badge variant="outline" className="text-[9px] font-black uppercase bg-muted text-muted-foreground">Lectura</Badge>
          )
        }}
      />
    </div>
  )
}


