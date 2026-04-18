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
import { Badge } from "@/components/ui/badge"
import { Package, ExternalLink, History } from 'lucide-react'
import Link from 'next/link'
import { AddPackageDialog } from '@/components/tenant/add-package-dialog'

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
      <div className="p-8 text-center bg-muted/20 rounded-xl border">
        <p>No se encontró información de tu casillero.</p>
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

  if (user.email === 'joel@mail.com') {
    console.log(`[DEBUG_PAQUETES] Email: ${user.email}`)
    console.log(`[DEBUG_PAQUETES] TenantID (URL): ${tenantData.id}`)
    console.log(`[DEBUG_PAQUETES] ClientID (Query): ${clientData.id}`)
    console.log(`[DEBUG_PAQUETES] Packages Found: ${packages?.length || 0}`)
    if (error) console.error(`[DEBUG_PAQUETES] Error:`, error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Mis Paquetes</h1>
            <p className="text-muted-foreground">Historial y estado de tus compras recibidas.</p>
        </div>
        <AddPackageDialog tenantId={tenantData.id} clientId={clientData.id} />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="responsive-table-container">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="whitespace-nowrap">Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead className="text-right">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {packages && packages.length > 0 ? (
                packages.map((pkg: any) => (
                    <TableRow key={pkg.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm font-medium">
                        {new Date(pkg.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold text-sm text-foreground">
                        {pkg.description || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1 min-w-[120px]">
                        <span className="font-mono text-sm font-bold">{pkg.tracking_number}</span>
                        {pkg.tracking_number && (
                            <a 
                            href={`https://www.17track.net/en/track-details?nums=${pkg.tracking_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                            Rastrear externo <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                        </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">{pkg.courier_name}</TableCell>
                    <TableCell className="text-right">
                        <StatusBadge status={pkg.status} />
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                        <p>Aún no tienes paquetes registrados.</p>
                    </div>
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
          <History className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
              <p className="text-sm font-bold">Historial de Pedidos</p>
              <p className="text-xs text-muted-foreground">
                  Aquí puedes ver tanto tus paquetes recién alertados como los que ya hemos procesado y entregado. 
                  Si un paquete no aparece, asegúrate de haberlo pre-alertado o espera 24h para su recepción en Miami.
              </p>
          </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    'pre-alertado': 'secondary',
    'recibido': 'outline',
    'en_transito': 'secondary',
    'listo_para_entrega': 'default',
    'entregado': 'default',
  }

  const labels: Record<string, string> = {
    'pre-alertado': 'Pre-alertado',
    'recibido': 'En Miami',
    'en_transito': 'En Tránsito',
    'listo_para_entrega': 'Listo p/ Entrega',
    'entregado': 'Entregado',
  }

  return (
    <Badge variant={variants[status] || 'outline'} className="whitespace-nowrap text-[10px] px-2 py-0 h-5">
      {labels[status] || status}
    </Badge>
  )
}
