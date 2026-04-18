'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface BrandingData {
  tenantId: string
  adminId: string
  logoUrl?: string
  avatarUrl?: string
  tenantSubdomain: string
}

export async function updateBranding(data: BrandingData) {
  const supabase = createAdminClient()

  console.log('Actualizando Branding:', data)

  // 1. Actualizar Tenant Logo si existe
  if (data.logoUrl !== undefined) {
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({ logo_url: data.logoUrl })
      .eq('id', data.tenantId)

    if (tenantError) {
      console.error('Error tenant branding:', tenantError)
      return { success: false, error: 'Error al actualizar logo de la empresa.' }
    }
  }

  // 2. Actualizar Avatar del Admin si existe
  if (data.avatarUrl !== undefined) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.avatarUrl })
      .eq('id', data.adminId)

    if (profileError) {
      console.error('Error profile branding:', profileError)
      return { success: false, error: 'Error al actualizar foto de perfil.' }
    }
  }

  revalidatePath(`/${data.tenantSubdomain}/admin/configuracion`)
  revalidatePath(`/${data.tenantSubdomain}/login`)
  
  return { success: true }
}
