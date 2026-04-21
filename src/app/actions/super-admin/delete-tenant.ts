'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

export async function deleteTenant(tenantId: string) {
  const auth = await requireSuperAdmin()
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const supabase = createAdminClient()

  // 1. Obtener datos del tenant antes de borrar (para logs o limpieza manual si es necesario)
  const { data: tenant, error: fetchError } = await supabase
    .from('tenants')
    .select('subdomain')
    .eq('id', tenantId)
    .single()

  if (fetchError || !tenant) {
    return { success: false, error: 'Empresa no encontrada.' }
  }

  // 2. Borrar en cascada (La DB se encarga de clientes, paquetes y settings por ON DELETE CASCADE)
  // Nota: Los usuarios de Auth de Supabase NO se borran en cascada automáticamente.
  // Pero aquí priorizaremos borrar el registro del tenant para liberar el subdominio.
  const { error: deleteError } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (deleteError) {
    console.error('Error al borrar tenant:', deleteError)
    return { success: false, error: `Error DB: ${deleteError.message}` }
  }

  // 3. Limpieza de Caché
  revalidatePath('/super-admin/tenants')
  
  return { success: true }
}
