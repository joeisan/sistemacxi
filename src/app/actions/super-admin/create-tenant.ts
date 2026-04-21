'use server'

import { requireSuperAdmin } from '@/lib/auth/action-auth'
import { z } from 'zod'

const addTenantSchema = z.object({
  // Tenant Data
  name: z.string().min(2),
  slug: z.string().min(2),
  subdomain: z.string().min(2),
  primaryColor: z.string().startsWith('#').default('#2563eb'),
  secondaryColor: z.string().startsWith('#').default('#f97316'),
  loginTitle: z.string().optional().nullable(),

  // Plan Data
  planType: z.enum(['monthly', 'annual']).default('monthly'),
  planStartDate: z.string().optional().nullable(),
  planExpiryDate: z.string().optional().nullable(),

  // Settings Data
  clientPrefix: z.string().min(2).max(10),
  address: z.string().min(5),
  cityStateZip: z.string().min(5),
  country: z.string().min(2),
  phone: z.string().min(5),

  // Admin User Data
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  adminName: z.string().min(2),
})

export async function createTenantAndAdmin(data: z.infer<typeof addTenantSchema>) {
  const auth = await requireSuperAdmin()
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const parsed = addTenantSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Datos inválidos.' }

  const {
    name, slug, subdomain, primaryColor, secondaryColor, loginTitle,
    planType, planStartDate, planExpiryDate,
    clientPrefix, address, cityStateZip, country, phone,
    adminEmail, adminPassword, adminName
  } = parsed.data

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(url, serviceKey)

  // 1. Crear el tenant
  const { data: tenantData, error: tenantError } = await adminClient
    .from('tenants')
    .insert({
      name,
      slug: slug || subdomain.toLowerCase(),
      subdomain: subdomain.toLowerCase(),
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      login_title: loginTitle || `Bienvenido a ${name}`,
      plan_type: planType,
      plan_start_date: planStartDate || new Date().toISOString(),
      plan_expiry_date: planExpiryDate || null,
      is_trial: false,
      is_active: true
    })
    .select('id')
    .single()

  if (tenantError || !tenantData) {
    console.error('Error al insertar Tenant:', tenantError)
    return { success: false, error: `Error DB (Tenant): ${tenantError?.message}` }
  }

  const tenantId = tenantData.id
  console.log('Tenant creado con ID:', tenantId)

  // 2. Insertar Settings
  const { error: settingsError } = await adminClient
    .from('tenant_settings')
    .insert({
      tenant_id: tenantId,
      client_code_prefix: clientPrefix,
      locker_address_line_1: address,
      locker_city_state_postal: cityStateZip,
      locker_country: country,
      locker_phone: phone
    })

  if (settingsError) {
    await adminClient.from('tenants').delete().eq('id', tenantId)
    return { success: false, error: `Error Settings: ${settingsError.message}` }
  }

  // 3. Crear Admin User en Auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: adminName,
      tenant_id: tenantId
    }
  })

  if (authError || !authData.user) {
    console.error('Error Auth Admin:', authError)
    await adminClient.from('tenants').delete().eq('id', tenantId)
    return { success: false, error: `Error Auth Admin: ${authError?.message}` }
  }

  // 4. Crear Perfil para el nuevo Admin
  const { error: adminProfileError } = await adminClient
    .from('profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenantId,
      email: adminEmail,
      full_name: adminName,
      role: 'admin'
    })

  if (adminProfileError) {
    console.error('Error al crear perfil del Admin:', adminProfileError)
    await adminClient.auth.admin.deleteUser(authData.user.id)
    await adminClient.from('tenants').delete().eq('id', tenantId)
    return { success: false, error: `Error Perfil: ${adminProfileError.message}` }
  }
  return { success: true }
}
