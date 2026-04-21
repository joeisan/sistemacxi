'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

interface TenantSettingsUpdate {
  tenantId: string
  newSequence?: number
  prefix?: string
  suffix?: string
}

interface TenantSettingsDbUpdate {
  current_sequence?: number
  client_code_prefix?: string
  client_code_suffix?: string
}

interface TenantBrandingUpdate {
  name: string
  primary_color?: string
  secondary_color?: string
}

export async function updateTenantSettings(data: TenantSettingsUpdate) {
  const auth = await requireTenantAdmin(data.tenantId)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()

  const updates: TenantSettingsDbUpdate = {}
  
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
  const auth = await requireTenantAdmin(tenantId)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()

  const updates: TenantBrandingUpdate = { name }
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
