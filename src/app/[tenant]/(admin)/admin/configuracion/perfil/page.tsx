import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getTenantBySubdomain } from "@/lib/tenant/get-tenant"
import { notFound, redirect } from "next/navigation"
import { BrandingConfigForm } from "@/components/tenant/branding-config-form"

export default async function AdminBrandingPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)
  if (!tenantData) return notFound()

  const supabaseServer = await createClient()
  const { data: { user } } = await supabaseServer.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = createAdminClient()
  
  // Obtener el perfil del admin actual para ver si ya tiene foto
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight uppercase">Personalización de Marca</h1>
        <p className="text-muted-foreground italic">
          Configura cómo ven los clientes tu empresa. Sube tu logo y tu foto de perfil profesional.
        </p>
      </div>

      <BrandingConfigForm 
        tenantId={tenantData.id}
        tenantSubdomain={tenant}
        adminId={user.id}
        currentLogoUrl={tenantData.logo_url}
        currentAvatarUrl={profile?.avatar_url}
      />
    </div>
  )
}
