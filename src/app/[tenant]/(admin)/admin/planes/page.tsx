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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign, Package, Truck } from 'lucide-react'
import { CreatePlanDialog } from '@/components/tenant/create-plan-dialog'

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

  // Calculate unique delivery fees (top 3 unique)
  const uniqueDeliveryFees = Array.from(new Set(plans?.map(p => p.delivery_fee) || []))
    .sort((a, b) => b - a)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Planes de Cobro</h1>
          <p className="text-muted-foreground">Define los niveles de precio para tus clientes en {tenantData.name}.</p>
        </div>
        <CreatePlanDialog tenantId={tenantData.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Planes Configurables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{plans?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cantidad de niveles de precio actuales</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" />
              Tarifas de Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {uniqueDeliveryFees.length > 0 ? (
                uniqueDeliveryFees.map((fee, i) => (
                  <div key={i} className="text-xl font-bold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                    ${fee.toFixed(2)}
                  </div>
                ))
              ) : (
                <div className="text-xl font-bold text-muted-foreground">$0.00</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Últimas tarifas únicas definidas en tus planes</p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-xl bg-card shadow-sm">
        <div className="responsive-table-container">
            <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead className="whitespace-nowrap font-bold">Nombre del Plan</TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">Costo x Libra</TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">Cargo Delivery</TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">Por Defecto</TableHead>
                <TableHead className="text-right whitespace-nowrap font-bold">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {plans && plans.length > 0 ? (
                plans.map((plan: any) => (
                    <TableRow key={plan.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold text-xs whitespace-nowrap">{plan.name}</TableCell>
                    <TableCell className="text-center font-mono text-xs whitespace-nowrap font-bold text-primary">${plan.cost_per_lb.toFixed(2)}</TableCell>
                    <TableCell className="text-center font-mono text-xs whitespace-nowrap font-bold text-amber-600">${plan.delivery_fee.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                        {plan.is_default ? (
                        <Badge className="rounded-full bg-green-100 px-2 py-0 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400 h-5">
                            Sí
                        </Badge>
                        ) : (
                        <span className="text-muted-foreground text-[10px] text-center">-</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <CreatePlanDialog tenantId={tenantData.id} plan={plan} />
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic text-xs">
                    No hay planes de precios definidos.
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
