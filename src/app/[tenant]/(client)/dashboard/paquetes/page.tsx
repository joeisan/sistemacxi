import { createClient } from '@/lib/supabase/server'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Package, ExternalLink, History, PackageSearch } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AddPackageDialog } from '@/components/tenant/add-package-dialog'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'

export default async function ClientPaquetesPage({
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

  // Fetch client info to get client_id
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .eq('tenant_id', tenantData.id)
    .single()

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-500">
        <div className="rounded-full bg-primary/10 p-4 mb-6">
          <Package className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Tu perfil aún no está activo</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 mb-8">
          Estamos terminando de configurar tu casillero. Por favor, intenta refrescar la página en unos momentos o contacta a soporte si el problema persiste.
        </p>
        <Button asChild variant="outline">
          <Link href={`/${tenant}/dashboard`}>Volver al Inicio</Link>
        </Button>
      </div>
    )
  }

  // Fetch packages for this client
  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .eq('client_id', clientData.id)
    .eq('tenant_id', tenantData.id)
    .order('created_at', { ascending: false })

  if (error) console.error(`[DEBUG_PAQUETES] Error:`, error)

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
      header: 'Descripción',
      render: (pkg) => (
        <span className="font-bold text-sm text-foreground">
          {pkg.description || 'Pedido sin descripción'}
        </span>
      ),
      priority: true
    },
    {
      header: 'Tracking de Origen',
      render: (pkg) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-bold bg-muted px-2 py-0.5 rounded border border-border/50 w-fit text-foreground">
            {pkg.tracking_number || 'PENDIENTE'}
          </span>
          {pkg.tracking_number && (
              <a 
              href={`https://www.17track.net/en/track-details?nums=${pkg.tracking_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] font-black text-primary hover:underline uppercase tracking-tighter"
              >
              Rastreo Externo <ExternalLink className="h-2.5 w-2.5" />
              </a>
          )}
        </div>
      ),
      priority: true
    },
    {
      header: 'Courier',
      accessorKey: 'courier_name',
      className: 'text-[11px] font-bold text-muted-foreground uppercase'
    },
    {
      header: 'Estado',
      render: (pkg) => <StatusBadge status={pkg.status} />,
      className: 'text-right'
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-primary/10 items-center justify-center text-primary shadow-inner">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Mis Paquetes</h1>
            <p className="text-xs font-medium text-muted-foreground">Monitoreo de tus compras desde el pre-alerta hasta la entrega.</p>
          </div>
        </div>
        <AddPackageDialog tenantId={tenantData.id} clientId={clientData.id} />
      </div>

      <DataTableResponsive
        data={packages || []}
        columns={columns}
        rowId={(pkg) => pkg.id}
        mobileConfig={{
          title: (pkg) => pkg.description || 'Pedido sin descripción',
          subtitle: (pkg) => `Tracking: ${pkg.tracking_number || 'No asignado'}`,
          badge: (pkg) => <StatusBadge status={pkg.status} />
        }}
        emptyMessage="Aún no has registrado paquetes."
      />

      <div className="mt-4 p-5 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-start gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
              <p className="text-sm font-black text-foreground uppercase tracking-tight">Manual de Seguimiento</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                  Aquí verás el ciclo de vida de tus pedidos. Los paquetes <strong>pre-alertados</strong> aparecerán apenas los registres. 
                  Una vez que lleguen a nuestra bodega en Miami, el estado cambiará a <strong>En Miami</strong> tras su procesamiento (aprox. 24h).
              </p>
          </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    'pre-alertado': { label: 'Pre-alertado', color: 'bg-slate-500/10 text-slate-700 border-slate-200' },
    'recibido': { label: 'En Miami', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
    'en_transito': { label: 'En Tránsito', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    'listo_para_entrega': { label: 'Listo p/ Entrega', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    'entregado': { label: 'Entregado', color: 'bg-green-500/10 text-green-700 border-green-200' },
  }

  const { label, color } = configs[status] || { label: status, color: 'bg-muted text-muted-foreground' }

  return (
    <Badge variant="outline" className={`whitespace-nowrap text-[9px] font-black uppercase tracking-tighter px-2 h-5 ${color} border-none`}>
      {label}
    </Badge>
  )
}
