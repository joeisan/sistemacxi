'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface TenantSettingsUpdate {
  tenantId: string
  newSequence?: number
  prefix?: string
  suffix?: string
}

export async function updateTenantSettings(data: TenantSettingsUpdate) {
  const adminClient = createAdminClient()

  console.log(`--- ACTUALIZANDO SETTINGS PARA TENANT: ${data.tenantId} ---`)

  const updates: any = {}
  
  if (data.newSequence !== undefined) {
    // Si el usuario quiere que el siguiente sea el 1000, debemos poner current_sequence = 999
    updates.current_sequence = Math.max(0, data.newSequence - 1)
  }
  
  if (data.prefix !== undefined) updates.client_code_prefix = data.prefix
  if (data.suffix !== undefined) updates.client_code_suffix = data.suffix

  const { error } = await adminClient
    .from('tenant_settings')
    .update(updates)
    .eq('tenant_id', data.tenantId)

  if (error) {
    console.error('Error updating tenant settings:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/[tenant]/admin/configuracion', 'page')
  return { success: true }
}

export async function updateTenantBranding(tenantId: string, name: string, primaryColor?: string, secondaryColor?: string) {
  const adminClient = createAdminClient()

  const updates: any = { name }
  if (primaryColor) updates.primary_color = primaryColor
  if (secondaryColor) updates.secondary_color = secondaryColor

  const { error } = await adminClient
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)

  if (error) {
    console.error('Error updating tenant branding:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/[tenant]/admin/configuracion', 'page')
  return { success: true }
}
