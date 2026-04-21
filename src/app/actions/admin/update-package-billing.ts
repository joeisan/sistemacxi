'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
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

  const { data: pkg, error: packageError } = await adminClient
    .from('packages')
    .select('tenant_id')
    .eq('id', data.packageId)
    .single()

  if (packageError || !pkg) {
    return { success: false, error: 'Paquete no encontrado.' }
  }

  const auth = await requireTenantAdmin(pkg.tenant_id)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

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

    const { data: pkg, error: packageError } = await adminClient
      .from('packages')
      .select('tenant_id, client_id')
      .eq('id', data.packageId)
      .single()

    if (packageError || !pkg) {
      return { success: false, error: 'Paquete no encontrado.' }
    }

    const auth = await requireTenantAdmin(pkg.tenant_id)
    if (!auth.ok) {
      return { success: false, error: auth.error }
    }

    // 1. Record the payment
    const { error: paymentError } = await adminClient
        .from('payments')
        .insert({
            tenant_id: pkg.tenant_id,
            client_id: pkg.client_id,
            package_id: data.packageId,
            amount: data.amount,
            method: data.method,
            notes: data.notes
        })

    if (paymentError) return { success: false, error: paymentError.message }

    // 2. Mark package as paid
    const { error: packageUpdateError } = await adminClient
        .from('packages')
        .update({ payment_status: 'paid' })
        .eq('id', data.packageId)

    if (packageUpdateError) return { success: false, error: packageUpdateError.message }

    revalidatePath('/admin/paquetes')
    revalidatePath('/dashboard/paquetes')
    return { success: true }
}
