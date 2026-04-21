'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

interface UpdateClientData {
    id: string
    fullName: string
    phone: string
    clientCode: string
    planId: string | null
}

export async function updateClient(data: UpdateClientData) {
  const adminClient = createAdminClient()

  const { data: client, error: clientError } = await adminClient
    .from('clients')
    .select('tenant_id')
    .eq('id', data.id)
    .single()

  if (clientError || !client) {
    return { success: false, error: 'Cliente no encontrado.' }
  }

  const auth = await requireTenantAdmin(client.tenant_id)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const { error } = await adminClient
    .from('clients')
    .update({
      full_name: data.fullName,
      phone: data.phone,
      client_code: data.clientCode,
      plan_id: data.planId
    })
    .eq('id', data.id)

  if (error) {
    console.error('Error al actualizar cliente:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/[tenant]/admin/clientes', 'page')
  return { success: true }
}
