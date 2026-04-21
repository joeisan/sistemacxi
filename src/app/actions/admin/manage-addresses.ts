'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

interface TenantAddressData {
  id?: string
  tenantId: string
  label: string
  addressLine1: string
  cityStateZip: string
  country: string
  phone: string
  isDefault: boolean
}

export async function upsertTenantAddress(data: TenantAddressData) {
  const auth = await requireTenantAdmin(data.tenantId)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()

  console.log(`--- GESTIONANDO DIRECCIÓN TENANT: ${data.tenantId} ---`)

  const payload = {
    tenant_id: data.tenantId,
    label: data.label,
    address_line_1: data.addressLine1,
    city_state_zip: data.cityStateZip,
    country: data.country,
    phone: data.phone,
    is_default: data.isDefault
  }

  // If this is set as default, unset others first
  if (data.isDefault) {
    await adminClient
      .from('tenant_addresses')
      .update({ is_default: false })
      .eq('tenant_id', data.tenantId)

    await adminClient
      .from('tenant_settings')
      .update({
        locker_address_line_1: data.addressLine1,
        locker_city_state_postal: data.cityStateZip,
        locker_country: data.country,
        locker_phone: data.phone,
      })
      .eq('tenant_id', data.tenantId)
  }

  let result
  if (data.id) {
    result = await adminClient
      .from('tenant_addresses')
      .update(payload)
      .eq('id', data.id)
  } else {
    result = await adminClient
      .from('tenant_addresses')
      .insert(payload)
  }

  if (result.error) {
    console.error('Error address management:', result.error)
    return { success: false, error: result.error.message }
  }

  revalidatePath('/admin/configuracion')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteTenantAddress(addressId: string, tenantId: string) {
  const auth = await requireTenantAdmin(tenantId)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()
  
  const { error } = await adminClient
    .from('tenant_addresses')
    .delete()
    .eq('id', addressId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/configuracion')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}
