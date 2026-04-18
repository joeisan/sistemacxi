'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateTenant(
  tenantId: string, 
  data: { 
    name?: string, 
    plan_type?: string, 
    plan_expiry_date?: string | null,
    is_active?: boolean
  }
) {
  const adminClient = createAdminClient()

  // Ensure is_trial is turned off if plan_type is changed from prueba to a paid option
  const dbData: any = { ...data };
  if (data.plan_type) {
    if (data.plan_type === 'prueba') {
      dbData.is_trial = true;
      dbData.trial_ends_at = data.plan_expiry_date;
      dbData.plan_expiry_date = null;
    } else {
      dbData.is_trial = false;
      dbData.trial_ends_at = null;
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
