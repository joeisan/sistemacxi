'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function requestUpgrade(formData: FormData) {
  const tenantId = formData.get('tenantId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!tenantId || !name || !email) {
    return { success: false, error: 'Datos incompletos.' }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminClient = createSupabaseClient(url, serviceKey)

  try {
    const { error } = await adminClient
      .from('tenants')
      .update({
        trial_upgrade_requested: true,
        trial_contact_name: name,
        trial_contact_email: email
      })
      .eq('id', tenantId)

    if (error) throw error

    return { success: true }
  } catch (error: unknown) {
    console.error('Error requesting upgrade:', error)
    return { success: false, error: 'Ocurrió un error. Intenta de nuevo más tarde.' }
  }
}
