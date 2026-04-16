import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EditClientDialog } from '@/components/tenant/edit-client-dialog'
import { ClientPackagesColumn } from '@/components/tenant/client-packages-column'

export default async function AdminClientesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

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

  // Fetch package counts per client
  const { data: allPackages } = await supabase
    .from('packages')
    .select('client_id, status')
    .eq('tenant_id', tenantData.id)

  // Build package stats per client
  const packageStats: Record<string, { total: number; active: number }> = {}
  if (allPackages) {
    for (const pkg of allPackages) {
      if (!packageStats[pkg.client_id]) {
        packageStats[pkg.client_id] = { total: 0, active: 0 }
      }
      packageStats[pkg.client_id].total++
      if (pkg.status !== 'entregado') {
        packageStats[pkg.client_id].active++
      }
    }
  }

  if (error) {
    console.error('Error loading clients:', error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Gestiona los clientes registrados en {tenantData.name}.</p>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="responsive-table-container">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[120px] whitespace-nowrap">Código</TableHead>
                <TableHead className="whitespace-nowrap">Nombre Completo</TableHead>
                <TableHead className="whitespace-nowrap">Correo Electrónico</TableHead>
                <TableHead className="whitespace-nowrap">Teléfono</TableHead>
                <TableHead className="whitespace-nowrap">Plan</TableHead>
                <TableHead className="text-center whitespace-nowrap">Paquetes</TableHead>
                <TableHead className="text-center whitespace-nowrap">Estado</TableHead>
                <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients && clients.length > 0 ? (
                clients.map((client: any) => {
                    const stats = packageStats[client.id] || { total: 0, active: 0 }
                    return (
                    <TableRow key={client.id}>
                    <TableCell className="font-mono font-bold text-primary text-sm">
                        {client.client_code}
                    </TableCell>
                    <TableCell className="font-bold text-sm whitespace-nowrap">{client.full_name}</TableCell>
                    <TableCell className="text-sm">{client.profiles?.email || 'N/A'}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{client.phone}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className="font-black border-primary/20 bg-primary/5 text-[11px] px-2 py-0.5 h-6">
                        {Array.isArray(client.pricing_plans) ? client.pricing_plans[0]?.name : (client.pricing_plans?.name || 'Estándar')}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <ClientPackagesColumn 
                          total={stats.total} 
                          active={stats.active}
                          clientId={client.id}
                        />
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant={client.profiles?.is_active ? "default" : "secondary"} className="text-[11px] px-2 py-0.5 h-6 font-bold">
                        {client.profiles?.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <EditClientDialog client={client} availablePlans={plans || []} />
                    </TableCell>
                    </TableRow>
                    )
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                    No hay clientes registrados todavía.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </div>
    </div>
  )
}
