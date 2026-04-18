import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ExternalLink, Edit } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatusToggleButton } from '@/components/super-admin/status-toggle-button'
import { SendAlertButton } from '@/components/super-admin/send-alert-button'
import { TrialActions } from '@/components/super-admin/trial-actions'
import { DeleteTenantButton } from '@/components/super-admin/delete-tenant-button'

export const dynamic = 'force-dynamic'

export default async function SuperAdminTenantsPage() {
  const supabase = createAdminClient()

  const { data: tenants, error } = await supabase
    .from('tenants')
    .select(`
      *,
      profiles (
        full_name,
        email,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tenants:', error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Empresas (Tenants)</h1>
          <p className="text-muted-foreground">Administra las instancias de clientes y sus suscripciones.</p>
        </div>
        <Link href="/super-admin/tenants/nuevo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        </Link>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="responsive-table-container">
            <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead className="font-bold whitespace-nowrap">Administrador</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Empresa / Dominio</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Plan / Expiración</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Estado Acceso</TableHead>
                <TableHead className="font-bold text-right whitespace-nowrap">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tenants && tenants.length > 0 ? (
                tenants.map((tenant: any) => (
                    <TableRow key={tenant.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                        <div className="flex flex-col min-w-[200px]">
                          {(() => {
                            const admin = tenant.profiles?.find((p: any) => p.role === 'admin')
                            if (admin) {
                              return (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground text-sm uppercase tracking-tight">{admin.full_name || 'Sin Nombre'}</span>
                                  </div>
                                  <span className="text-xs text-primary font-semibold">{admin.email}</span>
                                </>
                              )
                            } else {
                              return (
                                <>
                                  <span className="text-xs font-bold text-destructive uppercase">Sin Administrador</span>
                                  <span className="text-[10px] text-muted-foreground">{tenant.trial_contact_email || 'No contact email'}</span>
                                </>
                              )
                            }
                          })()}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">{tenant.name}</span>
                            {tenant.trial_upgrade_requested && (
                              <Badge variant="destructive" className="h-4 px-1 text-[8px] animate-pulse">SOLICITUD UPGRADE</Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded w-fit">{tenant.subdomain}.sistemacxi.vercel.app</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <Badge variant={tenant.is_trial ? "outline" : "secondary"} className={`w-fit text-[10px] uppercase font-bold tracking-wider px-2 ${tenant.is_trial ? 'border-primary text-primary' : ''}`}>
                              {tenant.is_trial ? 'Prueba 24h' : (tenant.plan_type || 'Activado')}
                          </Badge>
                        </div>
                        
                        {tenant.is_trial && tenant.trial_ends_at && (
                          <div className="flex flex-col">
                              <span className={`text-[10px] font-bold flex items-center gap-1 ${
                                  new Date(tenant.trial_ends_at) < new Date() ? 'text-destructive' : 'text-primary'
                              }`}>
                                  Expira: {new Date(tenant.trial_ends_at).toLocaleString()}
                              </span>
                              {new Date(tenant.trial_ends_at) < new Date() && (
                                  <span className="text-[8px] text-destructive uppercase font-black">Prueba Terminada</span>
                              )}
                          </div>
                        )}

                        {!tenant.is_trial && tenant.plan_expiry_date && (
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold flex items-center gap-1 ${
                                    new Date(tenant.plan_expiry_date) < new Date() ? 'text-destructive' : 'text-muted-foreground'
                                }`}>
                                    Plan Exp: {new Date(tenant.plan_expiry_date).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <StatusToggleButton 
                        tenantId={tenant.id} 
                        initialStatus={tenant.is_active} 
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex justify-end items-center gap-2">
                        <TrialActions tenantId={tenant.id} isTrial={tenant.is_trial} />
                        
                        <SendAlertButton tenantId={tenant.id} tenantName={tenant.name} />
                        
                        <Link href={`/super-admin/tenants/${tenant.id}`} title="Editar detalles">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-3.5 w-3.5" />
                            </Button>
                        </Link>

                        <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
                        
                        <a 
                            href={`https://${tenant.subdomain}.sistemacxi.vercel.app`} 
                            target="_blank"
                            title="Ir al sitio"
                            rel="noopener noreferrer"
                        >
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                            <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        </a>
                        </div>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic text-xs">
                    No hay empresas registradas.
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
