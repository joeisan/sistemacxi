'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

export async function deleteClient(clientId: string, tenantSubdomain: string) {
  const supabase = createAdminClient()

  // 1. Obtener el perfil asociado al cliente para borrarlo también si es necesario
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('profile_id, tenant_id')
    .eq('id', clientId)
    .single()

  if (fetchError || !client) {
    return { success: false, error: 'Cliente no encontrado.' }
  }

  const auth = await requireTenantAdmin(client.tenant_id)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  // 2. Borrar el cliente. 
  // Nota: La cascada borrará sus paquetes automáticamente.
  const { error: deleteClientError } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (deleteClientError) {
    console.error('Error al borrar cliente:', deleteClientError)
    return { success: false, error: `Error DB (Cliente): ${deleteClientError.message}` }
  }

  // 3. Borrar el perfil (esto eliminará también el acceso si el disparador de la DB no lo hace)
  if (client.profile_id) {
    const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', client.profile_id)
    
    if (deleteProfileError) {
        console.error('Error al borrar perfil:', deleteProfileError)
        // No fallamos la acción completa, pero lo logueamos
    }
  }

  // 4. Revalidar ruta
  revalidatePath(`/${tenantSubdomain}/admin/clientes`)
  
  return { success: true }
}
