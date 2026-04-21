'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireTenantAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

interface PricingPlanData {
  id?: string
  tenantId: string
  name: string
  costPerLb: number
  deliveryFee: number
}

export async function savePricingPlan(data: PricingPlanData) {
  const auth = await requireTenantAdmin(data.tenantId)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()
  const { count: existingPlans } = await adminClient
    .from('pricing_plans')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', data.tenantId)

  const payload = {
    tenant_id: data.tenantId,
    name: data.name,
    cost_per_lb: data.costPerLb,
    delivery_fee: data.deliveryFee,
    is_default: data.id ? undefined : (existingPlans || 0) === 0,
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

  const { data: plan, error: planError } = await adminClient
    .from('pricing_plans')
    .select('tenant_id')
    .eq('id', id)
    .single()

  if (planError || !plan) {
    return { success: false, error: 'Plan no encontrado.' }
  }

  const auth = await requireTenantAdmin(plan.tenant_id)
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  // Note: Prevention of deleting a plan used by clients could be added here
  const { error } = await adminClient
    .from('pricing_plans')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/planes')
  return { success: true }
}
