'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updatePackageStatus(packageId: string, status: string) {
  const adminClient = createAdminClient()

  console.log(`--- ACTUALIZANDO ESTADO PAQUETE: ${packageId} A ${status} ---`)

  const { error } = await adminClient
    .from('packages')
    .update({ status })
    .eq('id', packageId)

  if (error) {
    console.error('Error updating status:', error)
    return { success: false, error: error.message }
  }

  // Paths to refresh
  revalidatePath('/admin/paquetes')
  revalidatePath('/admin')
  revalidatePath('/dashboard/paquetes')
  revalidatePath('/dashboard')

  return { success: true }
}
