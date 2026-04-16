'use server'

import { createAdminClient } from '@/lib/supabase/admin'
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

  console.log(`--- ACTUALIZANDO CLIENTE: ${data.id} ---`)

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

  revalidatePath('/admin/clientes')
  return { success: true }
}
