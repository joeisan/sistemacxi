'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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
    const adminClient = createAdminClient()

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
  } catch (err: any) {
    console.error('Excepción en registerPackage:', err)
    return { success: false, error: 'Error interno del servidor. Intenta de nuevo.' }
  }
}
