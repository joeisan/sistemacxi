import { createAdminClient } from '@/lib/supabase/admin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function SuperAdminUsuariosPage() {
  const supabase = createAdminClient()

  const { data: users, error } = await supabase
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

  // Fetch tenant names separately to avoid join issues
  const tenantIds = [...new Set((users || []).filter((u: any) => u.tenant_id).map((u: any) => u.tenant_id))]
  let tenantMap: Record<string, string> = {}
  
  if (tenantIds.length > 0) {
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name')
      .in('id', tenantIds)
    
    if (tenants) {
      tenantMap = Object.fromEntries(tenants.map((t: any) => [t.id, t.name]))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Usuarios Globales</h1>
        <p className="text-muted-foreground">Todos los administradores y usuarios registrados en la plataforma.</p>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
            <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead className="font-bold whitespace-nowrap">Nombre</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Email</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Rol</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Empresa</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Fecha</TableHead>
                <TableHead className="text-right font-bold whitespace-nowrap">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users && users.length > 0 ? (
                users.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-xs whitespace-nowrap">{user.full_name}</TableCell>
                    <TableCell className="text-xs">{user.email}</TableCell>
                    <TableCell>
                        <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] sm:text-xs">
                        {user.tenant_id ? tenantMap[user.tenant_id] || 'Desconocida' : '— Global —'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                        <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-[10px] h-5">
                        {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic text-xs">
                    No hay usuarios registrados.
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

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    super_admin: { label: 'Super Admin', variant: 'destructive' },
    admin: { label: 'Admin Empresa', variant: 'default' },
    client: { label: 'Cliente', variant: 'outline' },
  }
  const { label, variant } = config[role] || { label: role, variant: 'secondary' as const }
  return <Badge variant={variant}>{label}</Badge>
}
