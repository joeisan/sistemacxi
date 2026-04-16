import { createClient } from '@/lib/supabase/server'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { DollarSign, Wallet, History, AlertCircle } from 'lucide-react'

export default async function ClientFinanzasPage({
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

  // Fetch client data
  const { data: clientData } = await supabase
    .from('clients')
    .select('id, plan_id, pricing_plans(name, cost_per_lb, delivery_fee)')
    .eq('profile_id', user.id)
    .single()

  if (!clientData) return notFound()

  // Fetch packages with billing
  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('client_id', clientData.id)
    .order('created_at', { ascending: false })

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', clientData.id)
    .order('created_at', { ascending: false })

  const pendingBalance = packages?.reduce((acc, p) => 
    p.payment_status === 'pending' ? acc + (p.total_amount || 0) : acc, 0) || 0

  const totalPaid = payments?.reduce((acc, pay) => acc + (pay.amount || 0), 0) || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Estado de Cuenta</h1>
        <p className="text-muted-foreground">Revisa tus facturas, pagos y saldo pendiente con {tenantData.name}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Saldo Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary font-mono">${pendingBalance.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Por pagar</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Pagado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-700 dark:text-green-400 font-mono">${totalPaid.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Historial total</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Mi Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{(clientData.pricing_plans as any)?.name || 'Estándar'}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
              ${(clientData.pricing_plans as any)?.cost_per_lb || 0}/lb + ${(clientData.pricing_plans as any)?.delivery_fee || 0} del.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Último Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
                {payments && payments.length > 0 
                    ? `$${payments[0].amount.toFixed(2)}` 
                    : '$0.00'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
                {payments && payments.length > 0 
                    ? new Date(payments[0].created_at).toLocaleDateString()
                    : 'Sin pagos'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Packages / Invoices */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 px-1">
                <Receipt className="h-5 w-5 text-primary" />
                Cargos por Paquetes
            </h2>
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="whitespace-nowrap">Tracking</TableHead>
                                <TableHead className="text-center">Peso</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages && packages.length > 0 ? (
                                packages.filter(p => (p.total_amount || 0) > 0).map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-mono text-xs whitespace-nowrap">{pkg.tracking_number}</TableCell>
                                        <TableCell className="text-center text-xs whitespace-nowrap">{pkg.weight_lb} lb</TableCell>
                                        <TableCell className="text-right font-bold text-xs whitespace-nowrap">${(pkg.total_amount || 0).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={pkg.payment_status === 'paid' ? 'default' : 'outline'} className={`text-[10px] px-2 py-0 h-5 ${pkg.payment_status === 'paid' ? 'bg-green-500 hover:bg-green-600' : 'border-amber-500 text-amber-600'}`}>
                                                {pkg.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic text-xs">
                                        No hay cargos registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 px-1">
                <DollarSign className="h-5 w-5 text-green-600" />
                Historial de Pagos
            </h2>
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="whitespace-nowrap">Fecha</TableHead>
                                <TableHead className="whitespace-nowrap">Método</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments && payments.length > 0 ? (
                                payments.map((pay) => (
                                    <TableRow key={pay.id}>
                                        <TableCell className="text-xs whitespace-nowrap">{new Date(pay.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="capitalize text-xs whitespace-nowrap">
                                            <Badge variant="secondary" className="text-[10px] font-normal h-5">{pay.method}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-green-600 text-xs whitespace-nowrap">${pay.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic text-xs">
                                        No se han registrado pagos todavía.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
          </div>
      </div>

      {pendingBalance > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                  Atención: Tienes un saldo pendiente de <strong>${pendingBalance.toFixed(2)}</strong>. Por favor, realiza tu pago para evitar retrasos en tus entregas.
              </p>
          </div>
      )}
    </div>
  )
}

function Receipt(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5V18" />
      <path d="M12 7V6.5" />
    </svg>
  )
}
