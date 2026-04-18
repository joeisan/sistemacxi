import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Badge } from "@/components/ui/badge"
import { DeleteUserDialog } from '@/components/super-admin/delete-user-dialog'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'
import { Users2, ShieldCheck, UserCog } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SuperAdminUsuariosPage() {
  const supabaseAdmin = createAdminClient()
  const supabaseServer = await createClient()

  const { data: { user: currentUser } } = await supabaseServer.auth.getUser()

  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      tenant_id
    `)
    .neq('role', 'client')
    .order('created_at', { ascending: false })

  const tenantIds = [...new Set((users || []).filter((u: any) => u.tenant_id).map((u: any) => u.tenant_id))]
  let tenantMap: Record<string, string> = {}
  
  if (tenantIds.length > 0) {
    const { data: tenants } = await supabaseAdmin
      .from('tenants')
      .select('id, name')
      .in('id', tenantIds)
    
    if (tenants) {
      tenantMap = Object.fromEntries(tenants.map((t: any) => [t.id, t.name]))
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      header: 'Usuario',
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-foreground">{u.full_name || 'Sin nombre'}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{u.email}</span>
        </div>
      )
    },
    {
      header: 'Rol',
      render: (u) => <RoleBadge role={u.role} />
    },
    {
      header: 'Institución / Empresa',
      render: (u) => (
        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider border-primary/20 bg-primary/5 text-primary">
          {u.tenant_id ? tenantMap[u.tenant_id] || 'Cargando...' : '— Global —'}
        </Badge>
      )
    },
    {
      header: 'Registro',
      render: (u) => (
        <span className="text-[10px] text-muted-foreground font-mono">
          {new Date(u.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (u) => (
        <Badge variant={u.is_active ? 'default' : 'secondary'} className="text-[9px] h-4 uppercase font-bold tracking-tighter">
          {u.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm border-primary/10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-indigo-500/10 items-center justify-center text-indigo-600 shadow-inner">
            <Users2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Usuarios Globales</h1>
            <p className="text-xs font-medium text-muted-foreground">Administración de accesos privilegiados para todo el ecosistema.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex border-indigo-500/20 text-indigo-600 bg-indigo-50/50 uppercase font-black tracking-widest text-[9px]">
                {users?.length || 0} Usuarios Totales
            </Badge>
        </div>
      </div>

      <DataTableResponsive
        data={users || []}
        columns={columns}
        rowId={(u) => u.id}
        mobileConfig={{
          title: (u) => u.full_name,
          subtitle: (u) => u.email,
          badge: (u) => <RoleBadge role={u.role} />
        }}
        actions={(u) => (
          currentUser?.id !== u.id ? (
            <DeleteUserDialog userId={u.id} userEmail={u.email} userName={u.full_name} />
          ) : (
             <Badge variant="outline" className="h-6 px-3 italic font-bold text-muted-foreground bg-muted/50 border-none">Eres Tú</Badge>
          )
        )}
      />
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; icon: any, color: string }> = {
    super_admin: { label: 'S. Admin', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    admin: { label: 'Admin', icon: UserCog, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    client: { label: 'Cliente', icon: Users2, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  }
  const { label, icon: Icon, color } = config[role] || { label: role, icon: Users2, color: 'text-slate-500 bg-slate-50' }
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${color}`}>
        <Icon className="h-2.5 w-2.5" />
        {label}
    </div>
  )
}
