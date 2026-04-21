'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'

interface RegisterPackageData {
  tenantId: string
  clientId: string
  trackingNumber: string
  courierName: string
  description?: string
  weightLb?: number
}

export async function registerPackage(data: RegisterPackageData) {
  try {
    const auth = await requireTenantAdmin(data.tenantId)
    if (!auth.ok) {
      return { success: false, error: auth.error }
    }

    const adminClient = createAdminClient()

    // 0. Verificar si el tenant está expirado o inactivo
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('*')
      .eq('id', data.tenantId)
      .single()

    if (!tenant || !tenant.is_active || isTenantExpired(tenant)) {
      return { 
        success: false, 
        error: !tenant?.is_active 
          ? 'La empresa está suspendida.' 
          : 'Tu plan ha expirado. El sistema está en MODO LECTURA.' 
      }
    }

    console.log(`--- REGISTRANDO PAQUETE PARA CLIENTE: ${data.clientId} ---`)

    const { error } = await adminClient
      .from('packages')
      .insert({
        tenant_id: data.tenantId,
        client_id: data.clientId,
        tracking_number: data.trackingNumber,
        courier_name: data.courierName,
        description: data.description,
        weight_lb: data.weightLb,
        status: 'recibido'
      })

    if (error) {
      console.error('Error al registrar paquete:', error)
      return { success: false, error: error.message }
    }

    // Revalidación por tags o paths específicos para evitar errores de cache dinámicos
    revalidatePath('/', 'layout') 
    
    return { success: true }
  } catch (err: unknown) {
    console.error('Excepción en registerPackage:', err)
    return { success: false, error: 'Error interno del servidor. Intenta de nuevo.' }
  }
}
