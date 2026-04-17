'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function extendTrial(tenantId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminClient = createSupabaseClient(url, serviceKey)

  try {
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('trial_ends_at')
      .eq('id', tenantId)
      .single()

    const currentExpiry = tenant?.trial_ends_at ? new Date(tenant.trial_ends_at) : new Date()
    const newExpiry = new Date(currentExpiry)
    newExpiry.setHours(newExpiry.getHours() + 24)

    const { error } = await adminClient
      .from('tenants')
      .update({
        trial_ends_at: newExpiry.toISOString(),
        trial_upgrade_requested: false // Reset the request flag
      })
      .eq('id', tenantId)

    if (error) throw error
    revalidatePath('/super-admin/tenants')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function activateFullPortal(tenantId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminClient = createSupabaseClient(url, serviceKey)

  try {
    const { error } = await adminClient
      .from('tenants')
      .update({
        is_trial: false,
        trial_upgrade_requested: false,
        plan_type: 'monthly',
        plan_start_date: new Date().toISOString()
      })
      .eq('id', tenantId)

    if (error) throw error
    revalidatePath('/super-admin/tenants')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
