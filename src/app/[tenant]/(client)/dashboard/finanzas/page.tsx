import { createClient } from '@/lib/supabase/server'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { DollarSign, Wallet, History, AlertCircle, Receipt, CreditCard } from 'lucide-react'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'

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

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-500">
        <div className="rounded-full bg-primary/10 p-4 mb-6">
          <CreditCard className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Tu estado de cuenta aún no está listo</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 mb-8">
          No logramos encontrar registros financieros para tu cuenta. Si acabas de registrarte, danos unos minutos. 
          De lo contrario, contacta a la administración de tu casillero.
        </p>
        <div className="flex gap-4">
             <Button asChild variant="default">
               <Link href={`/${tenant}/dashboard`}>Volver al Inicio</Link>
             </Button>
        </div>
      </div>
    )
  }

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

  const chargeColumns: ColumnDef<any>[] = [
    {
      header: 'Tracking',
      render: (p) => (
        <span className="font-mono text-[11px] font-bold bg-muted px-2 py-0.5 rounded border border-border/50 text-foreground">
          {p.tracking_number}
        </span>
      ),
      priority: true
    },
    {
      header: 'Peso',
      render: (p) => <span className="text-xs font-medium text-muted-foreground">{p.weight_lb} lb</span>,
      className: 'text-center'
    },
    {
      header: 'Total',
      render: (p) => (
        <span className="font-mono font-black text-xs text-foreground bg-primary/5 px-2 py-1 rounded-lg">
          ${(p.total_amount || 0).toFixed(2)}
        </span>
      ),
      className: 'text-right'
    },
    {
      header: 'Estado',
      render: (p) => (
        <Badge variant={p.payment_status === 'paid' ? 'default' : 'outline'} 
          className={`text-[9px] font-black uppercase tracking-tighter px-2 h-5 border-none ${p.payment_status === 'paid' ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>
          {p.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
        </Badge>
      ),
      className: 'text-right'
    }
  ]

  const paymentColumns: ColumnDef<any>[] = [
    {
      header: 'Fecha',
      render: (p) => (
        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">
          {new Date(p.created_at).toLocaleDateString()}
        </span>
      ),
      priority: true
    },
    {
      header: 'Método',
      render: (p) => (
        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-tighter h-5 bg-slate-100 text-slate-700">
          {p.method}
        </Badge>
      ),
      priority: true
    },
    {
      header: 'Monto',
      render: (p) => (
        <span className="font-mono font-black text-xs text-green-700 bg-green-500/10 px-2 py-1 rounded-lg">
          ${p.amount.toFixed(2)}
        </span>
      ),
      className: 'text-right'
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-indigo-500/10 items-center justify-center text-indigo-600 shadow-inner">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Estado de Cuenta</h1>
            <p className="text-xs font-medium text-muted-foreground">Gestión de facturación y movimientos financieros.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-primary/10 bg-indigo-500/[0.03] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
              <Wallet className="h-3.5 w-3.5" />
              Saldo Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black font-mono tracking-tighter ${pendingBalance > 0 ? 'text-amber-600' : 'text-primary'}`}>
              ${pendingBalance.toFixed(2)}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">Total por liquidar</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-green-500/10 bg-green-500/[0.03] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-green-700">
              <DollarSign className="h-3.5 w-3.5" />
              Total Pagado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-700 font-mono tracking-tighter">${totalPaid.toFixed(2)}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">Historial transaccional</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/10 shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
              <Receipt className="h-3.5 w-3.5" />
              Tarifa Vigente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-black text-foreground tracking-tight underline decoration-primary/30 decoration-2 underline-offset-4">
              {(clientData.pricing_plans as any)?.name || 'Estándar'}
            </div>
            <p className="text-xs font-bold text-muted-foreground mt-2 font-mono flex gap-2">
              <span className="bg-background border-primary/20 border rounded-lg px-2 py-1 text-primary shadow-sm font-black text-base">${(clientData.pricing_plans as any)?.cost_per_lb || 0}/lb</span>
              <span className="bg-background border-primary/20 border rounded-lg px-2 py-1 text-primary shadow-sm font-black text-base">+${(clientData.pricing_plans as any)?.delivery_fee || 0} del.</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-secondary-border shadow-sm bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Último Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tighter font-mono">
                {payments && payments.length > 0 
                    ? `$${payments[0].amount.toFixed(2)}` 
                    : '$0.00'}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">
                {payments && payments.length > 0 
                    ? new Date(payments[0].created_at).toLocaleDateString()
                    : 'Sin actividad reciente'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3 ml-1">
                <Receipt className="h-4 w-4 text-indigo-500" />
                Cargos por Paquetes
            </h2>
            <DataTableResponsive
              data={packages?.filter(p => (p.total_amount || 0) > 0) || []}
              columns={chargeColumns}
              rowId={(p) => p.id}
              mobileConfig={{
                title: (p) => p.tracking_number,
                subtitle: (p) => `$${(p.total_amount || 0).toFixed(2)}`,
                badge: (p) => (
                  <Badge variant={p.payment_status === 'paid' ? 'default' : 'outline'} 
                    className={`text-[8px] h-4 ${p.payment_status === 'paid' ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'} border-none uppercase`}>
                    {p.payment_status === 'paid' ? 'OK' : 'Pte'}
                  </Badge>
                )
              }}
              emptyMessage="No hay cargos registrados."
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3 ml-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                Historial de Pagos
            </h2>
            <DataTableResponsive
              data={payments || []}
              columns={paymentColumns}
              rowId={(p) => p.id}
              mobileConfig={{
                title: (p) => p.method,
                subtitle: (p) => `$${p.amount.toFixed(2)}`,
                badge: (p) => (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                )
              }}
              emptyMessage="No se han registrado pagos."
            />
          </div>
      </div>

      {pendingBalance > 0 && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold tracking-tight">
                  Atención: Tienes un saldo pendiente de <span className="underline decoration-2 underline-offset-2 decoration-amber-500/50">${pendingBalance.toFixed(2)}</span>. Por favor, regulariza tu cuenta para habilitar el despacho de tus pedidos.
              </p>
          </div>
      )}
    </div>
  )
}
