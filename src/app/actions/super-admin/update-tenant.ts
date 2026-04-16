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

  const { error } = await adminClient
    .from('tenants')
    .update(data)
    .eq('id', tenantId)

  if (error) {
    console.error('Error updating tenant:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/super-admin/tenants')
  revalidatePath(`/super-admin/tenants/${tenantId}`)
  
  return { success: true }
}
