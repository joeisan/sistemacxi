import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'
import { Badge } from "@/components/ui/badge"
import { EditClientDialog } from '@/components/tenant/edit-client-dialog'
import { DeleteClientButton } from '@/components/tenant/delete-client-button'
import { ClientPackagesColumn } from '@/components/tenant/client-packages-column'
import { CreateClientDialog } from '@/components/tenant/create-client-dialog'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'
import { Users, UserPlus } from 'lucide-react'

export default async function AdminClientesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const isExpired = isTenantExpired(tenantData)
  const supabase = createAdminClient()

  // Fetch clients for this tenant
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      client_code,
      full_name,
      phone,
      plan_id,
      profiles (
        email,
        is_active
      ),
      pricing_plans (
        name
      )
    `)
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: false })

  // Fetch all available plans for the selector
  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('id, name')
    .eq('tenant_id', tenantData.id)

  const { data: allPackages } = await supabase
    .from('packages')
    .select('client_id, status')
    .eq('tenant_id', tenantData.id)

  const packageStats: Record<string, { total: number; active: number }> = {}
  if (allPackages) {
    for (const pkg of allPackages) {
      if (!packageStats[pkg.client_id]) packageStats[pkg.client_id] = { total: 0, active: 0 }
      packageStats[pkg.client_id].total++
      if (pkg.status !== 'entregado') packageStats[pkg.client_id].active++
    }
  }

  if (error) console.error('Error loading clients:', error)

  const columns: ColumnDef<any>[] = [
    {
      header: 'Código',
      render: (c) => (
        <span className="font-mono font-bold text-primary text-sm bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
          {c.client_code}
        </span>
      ),
      priority: true
    },
    {
      header: 'Nombre Completo',
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground">{c.full_name}</span>
          <span className="text-[10px] text-muted-foreground">{Array.isArray(c.profiles) ? c.profiles[0]?.email : (c.profiles?.email || 'N/A')}</span>
        </div>
      )
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone',
      className: 'text-sm font-medium'
    },
    {
      header: 'Plan',
      render: (c) => (
        <Badge variant="outline" className="font-black border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-tighter px-2">
          {Array.isArray(c.pricing_plans) ? c.pricing_plans[0]?.name : (c.pricing_plans?.name || 'Estándar')}
        </Badge>
      )
    },
    {
      header: 'Paquetes',
      render: (c) => {
        const stats = packageStats[c.id] || { total: 0, active: 0 }
        return <ClientPackagesColumn total={stats.total} active={stats.active} clientId={c.id} />
      },
      className: 'text-center'
    },
    {
      header: 'Estado',
      render: (c) => {
        const isActive = Array.isArray(c.profiles) ? c.profiles[0]?.is_active : c.profiles?.is_active;
        return (
          <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] font-bold uppercase h-5">
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        )
      },
      className: 'text-center'
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-primary/10 items-center justify-center text-primary shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Clientes</h1>
            <p className="text-xs font-medium text-muted-foreground">Listado maestro de suscriptores y códigos de casillero.</p>
          </div>
        </div>
        {!isExpired && (
          <CreateClientDialog tenantId={tenantData.id} availablePlans={plans || []} />
        )}
      </div>

      <DataTableResponsive
        data={clients || []}
        columns={columns}
        rowId={(c) => c.id}
        mobileConfig={{
          title: (c: any) => c.full_name,
          subtitle: (c: any) => `Código: ${c.client_code}`,
          badge: (c: any) => {
            const isActive = Array.isArray(c.profiles) ? c.profiles[0]?.is_active : c.profiles?.is_active;
            return (
              <Badge variant={isActive ? "default" : "secondary"} className="text-[8px] h-4">
                {isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            )
          }
        }}
        actions={(c) => (
          <div className="flex items-center gap-2">
            {!isExpired ? (
              <>
                <EditClientDialog client={c} availablePlans={plans || []} />
                <DeleteClientButton clientId={c.id} clientName={c.full_name} tenantSubdomain={tenant} />
              </>
            ) : (
              <Badge variant="outline" className="text-[10px] font-black uppercase text-muted-foreground">Solo Lectura</Badge>
            )}
          </div>
        )}
      />
    </div>
  )
}
