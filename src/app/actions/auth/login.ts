'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  tenantSlug: z.string().optional()
})

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const supabase = await createClient()

  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }

  const { email, password, tenantSlug } = parsed.data

  // 1. Authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    console.error('Login error:', authError)
    return { success: false, error: 'Credenciales incorrectas o usuario inexistente.' }
  }

  // 2. Get user role using admin client (bypasses RLS)
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError)
    return { success: false, error: 'No se encontró el perfil del usuario.' }
  }

  // 3. Determine redirect based on role
  // ALWAYS return root-relative paths. The middleware handles subdomain/path mapping.
  let redirectPath = '/'

  switch (profile.role) {
    case 'super_admin':
      redirectPath = '/super-admin'
      break
    case 'admin':
      redirectPath = '/admin'
      break
    case 'client':
    default:
      redirectPath = '/dashboard'
      break
  }

  return { success: true, redirectPath }
}
