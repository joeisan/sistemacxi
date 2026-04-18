import { createAdminClient } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ExternalLink, Edit, Building2 } from 'lucide-react'
import { headers } from 'next/headers'
import { Badge } from "@/components/ui/badge"
import { StatusToggleButton } from '@/components/super-admin/status-toggle-button'
import { SendAlertButton } from '@/components/super-admin/send-alert-button'
import { TrialActions } from '@/components/super-admin/trial-actions'
import { DeleteTenantButton } from '@/components/super-admin/delete-tenant-button'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'

export const dynamic = 'force-dynamic'

export default async function SuperAdminTenantsPage() {
  const supabase = createAdminClient()
  const host = (await headers()).get('host') || ''
  
  // Determine root domain
  const parts = host.split('.')
  let rootDomain = host
  if (host.includes('sistemacxi.vercel.app')) {
    rootDomain = 'sistemacxi.vercel.app'
  } else if (parts.length > 2 && !host.includes('localhost')) {
    rootDomain = parts.slice(-2).join('.')
  } else if (host.includes('localhost')) {
    rootDomain = 'localhost:3000'
  }

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

  if (error) console.error('Error fetching tenants:', error)

  const columns: ColumnDef<any>[] = [
    {
      header: 'Administrador',
      render: (tenant) => {
        const admin = tenant.profiles?.find((p: any) => p.role === 'admin')
        if (admin) {
          return (
            <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm uppercase tracking-tight">{admin.full_name || 'Sin Nombre'}</span>
                <span className="text-xs text-primary font-bold">{admin.email}</span>
              </div>
          )
        }
        return (
          <div className="flex flex-col">
              <span className="text-xs font-bold text-destructive uppercase">Sin Administrador</span>
              <span className="text-xs text-muted-foreground">{tenant.trial_contact_email || 'No contact email'}</span>
            </div>
        )
      }
    },
    {
      header: 'Empresa / Dominio',
      render: (tenant) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">{tenant.name}</span>
            {tenant.trial_upgrade_requested && (
              <Badge variant="destructive" className="h-4 px-1 text-[10px] animate-pulse">SOLICITUD UPGRADE</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit italic">{tenant.subdomain}.{rootDomain}</span>
        </div>
      )
    },
    {
      header: 'Plan / Expiración',
      render: (tenant) => (
        <div className="flex flex-col gap-1">
          <Badge variant={tenant.is_trial ? "outline" : "secondary"} className={cn("w-fit text-xs uppercase font-bold tracking-wider px-2", tenant.is_trial && "border-primary text-primary bg-primary/5")}>
            {tenant.is_trial ? 'Prueba 24h' : (tenant.plan_type || 'Activado')}
          </Badge>
          
          {tenant.is_trial && tenant.trial_ends_at && (
            <div className="flex flex-col">
              <span className={cn("text-xs font-bold", new Date(tenant.trial_ends_at) < new Date() ? 'text-destructive' : 'text-primary')}>
                Exp: {new Date(tenant.trial_ends_at).toLocaleString()}
              </span>
            </div>
          )}

          {!tenant.is_trial && tenant.plan_expiry_date && (
            <span className={cn("text-xs font-bold", new Date(tenant.plan_expiry_date) < new Date() ? 'text-destructive' : 'text-muted-foreground')}>
              Vence: {new Date(tenant.plan_expiry_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Estado Acceso',
      render: (tenant) => (
        <StatusToggleButton tenantId={tenant.id} initialStatus={tenant.is_active} />
      )
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-primary/10 items-center justify-center text-primary shadow-inner">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Empresas (Tenants)</h1>
            <p className="text-xs font-medium text-muted-foreground">Admisión de clientes y control de suscripciones globales.</p>
          </div>
        </div>
        <Link href="/super-admin/tenants/nuevo">
          <Button className="shadow-lg shadow-primary/20 font-bold uppercase tracking-tight">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        </Link>
      </div>

      <DataTableResponsive
        data={tenants || []}
        columns={columns}
        rowId={(t) => t.id}
        mobileConfig={{
          title: (t) => t.name,
          subtitle: (t) => `${t.subdomain}.${rootDomain}`,
          badge: (t) => (
            <Badge variant={t.is_active ? "default" : "destructive"} className="text-[8px] h-4">
              {t.is_active ? 'Activo' : 'Suspendido'}
            </Badge>
          )
        }}
        actions={(tenant) => {
          const protocol = host.includes('localhost') ? 'http' : 'https'
          const isVercel = host.includes('sistemacxi.vercel.app')
          const companyUrl = isVercel 
            ? `https://sistemacxi.vercel.app/${tenant.subdomain}`
            : `${protocol}://${tenant.subdomain}.${rootDomain}`
          return (
            <>
              <TrialActions tenantId={tenant.id} isTrial={tenant.is_trial} />
              <SendAlertButton tenantId={tenant.id} tenantName={tenant.name} />
              <Link href={`/super-admin/tenants/${tenant.id}`}>
                <Button variant="outline" size="icon" className="h-8 w-8 hover:border-primary hover:text-primary transition-all">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
              <a href={companyUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </>
          )
        }}
      />
    </div>
  )
}
