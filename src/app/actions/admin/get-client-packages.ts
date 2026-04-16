'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getClientPackages(clientId: string) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('packages')
    .select('id, tracking_number, courier_name, status, description, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client packages:', error)
    return { success: false, data: [] }
  }

  return { success: true, data }
}
