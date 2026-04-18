import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { StatusSelector } from '@/components/tenant/status-selector'
import { BillingDialog } from '@/components/tenant/billing-dialog'

export default async function AdminPaquetesPage({
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Paquetes</h1>
          <p className="text-muted-foreground">Control de inventario y estados de envío para {tenantData.name}.</p>
        </div>
        {!isExpired ? (
          <Button asChild>
            <Link href="/admin/paquetes/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Paquete
            </Link>
          </Button>
        ) : (
          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 font-black px-4 py-2">
            PLAN EXPIRADO - MODO LECTURA
          </Badge>
        )}
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="responsive-table-container">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="whitespace-nowrap">Fecha</TableHead>
                <TableHead className="whitespace-nowrap">Cliente</TableHead>
                <TableHead className="whitespace-nowrap">Tracking #</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead className="text-center">Peso</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Estado Sistema</TableHead>
                <TableHead className="text-right">Cobro</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {packages && packages.length > 0 ? (
                packages.map((pkg: any) => (
                    <TableRow key={pkg.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm font-medium">
                        {new Date(pkg.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col min-w-[140px]">
                        <span className="font-bold text-primary text-sm">{pkg.clients?.client_code}</span>
                        <span className="text-xs text-muted-foreground font-bold truncate max-w-[120px]">{pkg.clients?.full_name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-bold whitespace-nowrap">{pkg.tracking_number || 'N/A'}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap font-medium">{pkg.courier_name}</TableCell>
                    <TableCell className="text-center font-mono text-sm font-bold">
                        {pkg.weight_lb ? `${pkg.weight_lb} lb` : '-'}
                    </TableCell>
                    <TableCell className="text-center font-mono font-black text-sm text-foreground">
                        {pkg.total_amount > 0 ? `$${pkg.total_amount.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                        {!isExpired ? (
                          <StatusSelector packageId={pkg.id} currentStatus={pkg.status} />
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{pkg.status.replace('_', ' ')}</Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        {!isExpired ? (
                          <BillingDialog 
                              packageData={pkg} 
                              clientPlan={pkg.clients?.pricing_plans} 
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground italic">Solo lectura</span>
                        )}
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">
                    No hay paquetes registrados todavía.
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


