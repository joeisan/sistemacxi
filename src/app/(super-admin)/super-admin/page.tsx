import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const supabase = createAdminClient()

  const { count: tenantCount } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: packageCount } = await supabase
    .from('packages')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Global</h1>
        <p className="text-muted-foreground">Administración de la plataforma Multi-tenant.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Empresas (Tenants)</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenantCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Negocios registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Usuarios Globales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Super admins, admins y clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Paquetes en Red</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📦</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packageCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Procesados en total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
