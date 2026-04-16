'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addCourier({ tenantId, name }: { tenantId: string, name: string }) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('couriers')
    .insert({ tenant_id: tenantId, name })

  if (error) {
    console.error('Error adding courier:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/configuracion')
  revalidatePath('/admin/paquetes/nuevo')
  return { success: true }
}

export async function deleteCourier(courierId: string) {
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('couriers')
    .delete()
    .eq('id', courierId)

  if (error) {
    console.error('Error deleting courier:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/configuracion')
  revalidatePath('/admin/paquetes/nuevo')
  return { success: true }
}
