'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface PreAlertData {
  tenantId: string
  clientId: string
  trackingNumber: string
  courierName: string
  description?: string
}

export async function createPreAlert(data: PreAlertData) {
  // Verify the user is authenticated first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Verify this client belongs to the authenticated user
  const { data: clientInfo } = await supabase
    .from('clients')
    .select('id, profile_id')
    .eq('id', data.clientId)
    .eq('profile_id', user.id)
    .single()

  if (!clientInfo) {
    return { success: false, error: 'Cliente no encontrado' }
  }

  // Use admin client to bypass RLS for insert
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('packages')
    .insert({
      tenant_id: data.tenantId,
      client_id: data.clientId,
      tracking_number: data.trackingNumber,
      courier_name: data.courierName,
      description: data.description || '',
      status: 'pre-alertado'
    })

  if (error) {
    console.error('Error creating pre-alert:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/[tenant]/dashboard/paquetes', 'page')
  return { success: true }
}

export async function deletePreAlert(packageId: string) {
  // Verify the user is authenticated first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Use admin client but verify ownership
  const adminClient = createAdminClient()

  // Verify the package belongs to this user and is pre-alertado
  const { data: pkg } = await adminClient
    .from('packages')
    .select('id, clients!inner(profile_id)')
    .eq('id', packageId)
    .eq('status', 'pre-alertado')
    .single()

  if (!pkg || (pkg as any).clients?.profile_id !== user.id) {
    return { success: false, error: 'Paquete no encontrado o no autorizado' }
  }

  const { error } = await adminClient
    .from('packages')
    .delete()
    .eq('id', packageId)
    .eq('status', 'pre-alertado')

  if (error) {
    console.error('Error deleting pre-alert:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/[tenant]/dashboard/paquetes', 'page')
  return { success: true }
}
