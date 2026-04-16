import { createClient } from '@/lib/supabase/server'
import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import { ProfileForm } from '@/components/tenant/profile-form'

export default async function ClientProfilePage({
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

  // Fetch client details
  const { data: clientData } = await supabase
    .from('clients')
    .select('full_name')
    .eq('profile_id', user.id)
    .eq('tenant_id', tenantData.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración de seguridad.</p>
      </div>

      <ProfileForm 
        initialData={{
          fullName: clientData?.full_name || 'Desconocido',
          email: user.email || ''
        }} 
      />
    </div>
  )
}
