'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteTenant(tenantId: string) {
  const adminClient = createAdminClient()

  console.log(`--- ELIMINANDO TENANT: ${tenantId} ---`)

  // 1. Opcional: Podríamos eliminar también los usuarios asociados en Auth, 
  // pero por ahora eliminaremos los perfiles y registros de DB.
  // Gracias a ON DELETE CASCADE en el schema SQL, borrar el tenant
  // debería limpiar tenant_settings, packages, etc.
  
  const { error } = await adminClient
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (error) {
    console.error('Error al eliminar tenant:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/super-admin/tenants')
  revalidatePath('/super-admin')
  
  return { success: true }
}
