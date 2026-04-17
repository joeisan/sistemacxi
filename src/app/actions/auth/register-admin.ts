'use server'

import { z } from 'zod'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const registerAdminSchema = z.object({
  businessName: z.string().min(2, "Mínimo 2 caracteres"),
  subdomain: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export async function registerAdmin(data: z.infer<typeof registerAdminSchema>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!url || !serviceKey) {
    return { success: false, error: 'Configuración del servidor incompleta.' }
  }

  const adminClient = createSupabaseClient(url, serviceKey)

  const parsed = registerAdminSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { businessName, subdomain, email, password } = parsed.data
  const cleanSubdomain = subdomain.toLowerCase()

  try {
    // 1. Verificar si el subdominio ya existe
    const { data: existingTenant } = await adminClient
      .from('tenants')
      .select('id')
      .eq('subdomain', cleanSubdomain)
      .single()

    if (existingTenant) {
      return { success: false, error: 'El subdominio ya está en uso. Prueba con otro.' }
    }

    // 2. Crear el tenant con TRIAL de 24 horas
    const trialEndsAt = new Date()
    trialEndsAt.setHours(trialEndsAt.getHours() + 24)

    const { data: tenantData, error: tenantError } = await adminClient
      .from('tenants')
      .insert({
        name: businessName,
        subdomain: cleanSubdomain,
        slug: cleanSubdomain,
        is_trial: true,
        trial_ends_at: trialEndsAt.toISOString(),
        plan_type: 'monthly',
        plan_start_date: new Date().toISOString(),
        is_active: true
      })
      .select('id')
      .single()

    if (tenantError || !tenantData) throw new Error(`Error Tenant: ${tenantError.message}`)

    const tenantId = tenantData.id

    // 3. Crear configuraciones básicas por defecto
    await adminClient.from('tenant_settings').insert({
      tenant_id: tenantId,
      client_code_prefix: businessName.substring(0, 3).toUpperCase(),
      locker_address_line_1: "123 Trial Way, Miami",
      locker_city_state_postal: "Miami, FL 33101",
      locker_country: "USA",
      locker_phone: "305-000-0000"
    })

    // 4. Crear usuario Admin en Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: `Admin ${businessName}`,
        tenant_id: tenantId
      }
    })

    if (authError || !authData.user) throw new Error(`Error Auth: ${authError?.message || 'Usuario no creado'}`)

    // 5. Crear Perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        tenant_id: tenantId,
        email,
        full_name: `Admin ${businessName}`,
        role: 'admin'
      })

    if (profileError) throw new Error(`Error Perfil: ${profileError.message}`)

    return { success: true, subdomain: cleanSubdomain }
  } catch (error: any) {
    console.error('Error en registro:', error)
    return { success: false, error: error.message }
  }
}
