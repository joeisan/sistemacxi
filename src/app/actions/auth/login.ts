'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { headers } from 'next/headers'

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
  const host = (await headers()).get('host') || ''
  
  // Calculate root domain dynamically
  const parts = host.split('.')
  let currentRoot = host
  if (parts.length > 2 && !host.includes('localhost')) {
    currentRoot = parts.slice(-2).join('.')
  } else if (host.includes('localhost')) {
    currentRoot = 'localhost:3000'
  }

  // Check if we are already on a subdomain
  const isOnSubdomain = parts.length > 2 || (host.includes('localhost') && host.split('.').length > 1 && !host.startsWith('localhost'))

  let redirectPath = '/'

  if (profile.role === 'super_admin') {
    redirectPath = '/super-admin'
  } else {
    // Determine the tenant subdomain
    let activeSubdomain = tenantSlug // This is a bit confusingly named in the schema/params
    if (!activeSubdomain && profile.tenant_id) {
      const { data: tenant } = await adminClient
        .from('tenants')
        .select('subdomain')
        .eq('id', profile.tenant_id)
        .single()
      
      if (tenant) {
        activeSubdomain = tenant.subdomain
      }
    }

    const basePath = profile.role === 'admin' ? '/admin' : '/dashboard'
    
    // If we are already on the correct subdomain, use a clean path.
    // Otherwise, use the path with the subdomain segment so the dynamic route [tenant] matches.
    if (isOnSubdomain) {
      redirectPath = basePath
    } else {
      redirectPath = activeSubdomain ? `/${activeSubdomain}${basePath}` : basePath
    }
  }

  return { success: true, redirectPath }
}
