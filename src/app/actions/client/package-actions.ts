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

function normalizeTrackingNumber(value: string) {
  return value.trim().toUpperCase()
}

export async function createPreAlert(data: PreAlertData) {
  // Verify the user is authenticated first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const normalizedTrackingNumber = normalizeTrackingNumber(data.trackingNumber)

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

  // 1. Check for duplicate tracking number within the same tenant
  const { data: existingPackage } = await adminClient
    .from('packages')
    .select('id')
    .eq('tenant_id', data.tenantId)
    .eq('tracking_number', normalizedTrackingNumber)
    .single()

  if (existingPackage) {
    return { success: false, error: 'Este número de tracking ya ha sido registrado o pre-alertado anteriormente.' }
  }

  const { error } = await adminClient
    .from('packages')
    .insert({
      tenant_id: data.tenantId,
      client_id: data.clientId,
      tracking_number: normalizedTrackingNumber,
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

export async function deletePreAlert() {
  return { success: false, error: 'Los paquetes pre-alertados no pueden eliminarse desde la cuenta del cliente.' }
}
