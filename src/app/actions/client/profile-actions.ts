'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProfileUpdateData {
  fullName: string
  phone: string
  clientId: string
  profileId: string
  tenant: string
}

export async function updateClientProfile(data: ProfileUpdateData) {
  const supabase = await createClient()

  // 1. Update profiles table (for full_name)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: data.fullName })
    .eq('id', data.profileId)

  if (profileError) return { success: false, error: profileError.message }

  // 2. Update clients table
  const { error: clientError } = await supabase
    .from('clients')
    .update({ 
      full_name: data.fullName,
      phone: data.phone 
    })
    .eq('id', data.clientId)

  if (clientError) return { success: false, error: clientError.message }

  revalidatePath(`/${data.tenant}/dashboard/perfil`)
  return { success: true }
}
