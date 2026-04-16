'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface BillingUpdateData {
  packageId: string
  weightLb: number
  shippingCost: number
  extraCost: number
  totalAmount: number
  paymentStatus: string
}

export async function updatePackageBilling(data: BillingUpdateData) {
  const adminClient = createAdminClient()

  console.log(`--- ACTUALIZANDO FACTURACIÓN PAQUETE: ${data.packageId} ---`)

  const { error } = await adminClient
    .from('packages')
    .update({
      weight_lb: data.weightLb,
      shipping_cost: data.shippingCost,
      extra_cost: data.extraCost,
      total_amount: data.totalAmount,
      payment_status: data.paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.packageId)

  if (error) {
    console.error('Error al actualizar facturación:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/paquetes')
  revalidatePath('/dashboard/paquetes')
  
  return { success: true }
}

export async function registerPayment(data: {
    tenantId: string
    clientId: string
    packageId: string
    amount: number
    method: string
    notes?: string
}) {
    const adminClient = createAdminClient()

    // 1. Record the payment
    const { error: paymentError } = await adminClient
        .from('payments')
        .insert({
            tenant_id: data.tenantId,
            client_id: data.clientId,
            package_id: data.packageId,
            amount: data.amount,
            method: data.method,
            notes: data.notes
        })

    if (paymentError) return { success: false, error: paymentError.message }

    // 2. Mark package as paid
    const { error: packageError } = await adminClient
        .from('packages')
        .update({ payment_status: 'paid' })
        .eq('id', data.packageId)

    if (packageError) return { success: false, error: packageError.message }

    revalidatePath('/admin/paquetes')
    revalidatePath('/dashboard/paquetes')
    return { success: true }
}
