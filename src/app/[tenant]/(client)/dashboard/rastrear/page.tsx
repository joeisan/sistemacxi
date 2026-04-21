import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TrackingSearchClient } from '@/components/tenant/tracking-search-client'

export default async function ClientRastrearPage({
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

  // Fetch client info to pass to the registration dialog
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .eq('tenant_id', tenantData.id)
    .single()

  return (
    <TrackingSearchClient 
      tenantId={tenantData.id} 
      clientId={clientData?.id}
      tenantSlug={tenant}
    />
  )
}
