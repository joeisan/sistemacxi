'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleTenantStatus(tenantId: string, currentStatus: boolean) {
  const adminClient = createAdminClient()

  console.log(`--- CAMBIANDO ESTADO TENANT: ${tenantId} A ${!currentStatus} ---`)

  const { error } = await adminClient
    .from('tenants')
    .update({ is_active: !currentStatus })
    .eq('id', tenantId)

  if (error) {
    console.error('Error toggling status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/super-admin/tenants')
  return { success: true }
}

export async function sendTenantAlert(tenantId: string, message: string, type: string = 'info') {
  const adminClient = createAdminClient()

  console.log(`--- ENVIANDO ALERTA ---`)

  if (tenantId === 'all') {
    // 1. Obtener todos los tenants
    const { data: tenants } = await adminClient.from('tenants').select('id')
    
    if (!tenants || tenants.length === 0) return { success: true }

    // 2. Insertar alertas para todos
    const alerts = tenants.map(t => ({
      tenant_id: t.id,
      message,
      type,
      is_read: false
    }))

    const { error } = await adminClient.from('tenant_alerts').insert(alerts)
    if (error) {
      console.error('Error sending global alerts:', error)
      return { success: false, error: error.message }
    }
  } else {
    // Envío individual
    const { error } = await adminClient
      .from('tenant_alerts')
      .insert({
        tenant_id: tenantId,
        message,
        type,
        is_read: false
      })

    if (error) {
      console.error('Error sending alert:', error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/super-admin/tenants')
  return { success: true }
}
