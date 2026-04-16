'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface PricingPlanData {
  id?: string
  tenantId: string
  name: string
  costPerLb: number
  deliveryFee: number
}

export async function savePricingPlan(data: PricingPlanData) {
  const adminClient = createAdminClient()

  const payload = {
    tenant_id: data.tenantId,
    name: data.name,
    cost_per_lb: data.costPerLb,
    delivery_fee: data.deliveryFee,
  }

  if (data.id) {
    const { error } = await adminClient
      .from('pricing_plans')
      .update(payload)
      .eq('id', data.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await adminClient
      .from('pricing_plans')
      .insert(payload)

    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/admin/planes')
  return { success: true }
}

export async function deletePricingPlan(id: string) {
  const adminClient = createAdminClient()

  // Note: Prevention of deleting a plan used by clients could be added here
  const { error } = await adminClient
    .from('pricing_plans')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/planes')
  return { success: true }
}
