'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

interface TenantUpdatePayload {
  name?: string
  plan_type?: string
  plan_expiry_date?: string | null
  is_active?: boolean
  is_trial?: boolean
  trial_ends_at?: string | null
}

export async function updateTenant(
  tenantId: string, 
  data: { 
    name?: string, 
    plan_type?: string, 
    plan_expiry_date?: string | null,
    is_active?: boolean
  }
) {
  const auth = await requireSuperAdmin()
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()

  // Ensure is_trial is turned off if plan_type is changed from prueba to a paid option
  const dbData: TenantUpdatePayload = { ...data }
  if (data.plan_type) {
    if (data.plan_type === 'prueba') {
      dbData.is_trial = true
      dbData.trial_ends_at = data.plan_expiry_date
      dbData.plan_expiry_date = null
    } else {
      dbData.is_trial = false
      dbData.trial_ends_at = null
    }
  }

  const { error } = await adminClient
    .from('tenants')
    .update(dbData)
    .eq('id', tenantId)

  if (error) {
    console.error('Error updating tenant:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/super-admin/tenants')
  revalidatePath(`/super-admin/tenants/${tenantId}`)
  
  // Revalidate globally to ensure tenant dashboards pick up the change immediately
  // Since subdomains are involved, we revalidate the root segments
  revalidatePath('/', 'layout')
  
  return { success: true }
}
