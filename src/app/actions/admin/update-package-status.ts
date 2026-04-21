'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

export async function updatePackageStatus(packageId: string, status: string) {
  const adminClient = createAdminClient()

  const { data: pkg, error: packageError } = await adminClient
    .from('packages')
    .select('tenant_id')
    .eq('id', packageId)
    .single()

  if (packageError || !pkg) {
    return { success: false, error: 'Paquete no encontrado.' }
  }

  const auth = await requireTenantAdmin(pkg.tenant_id)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

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
