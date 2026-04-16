'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const setupSchema = z.object({
  firstName: z.string().min(2, 'Name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function setupSuperAdmin(data: z.infer<typeof setupSchema>) {
  // Usamos Service Role para bypasear RLS y confirmar email automáticamente
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
    return { success: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local' }
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // 1. Verificar que no exista ya un super admin
  const { data: superAdmins } = await adminClient
    .from('profiles')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1)
    
  if (superAdmins && superAdmins.length > 0) {
    return { success: false, error: 'Ya existe un administrador global configurado.' }
  }

  const parsed = setupSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }

  const { firstName, lastName, email, password } = parsed.data
  const fullName = `${firstName} ${lastName}`

  // 2. Crear usuario con email auto-confirmado (admin API)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'super_admin'
    }
  })

  if (authError || !authData.user) {
    console.error('Error creando super admin en Auth:', authError)
    return { success: false, error: authError?.message || 'Error al crear la cuenta maestra.' }
  }

  const userId = authData.user.id

  // 3. Crear Profile con Service Role (bypasea RLS)
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: userId,
      email: email,
      full_name: fullName,
      role: 'super_admin',
      tenant_id: null
    })

  if (profileError) {
    console.error('Error creating super admin profile:', profileError)
    return { success: false, error: 'Error creando perfil maestro: ' + profileError.message }
  }

  // 4. Ahora hacemos login con el cliente normal para establecer la sesión/cookies
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    console.error('Error auto-login:', loginError)
    // No es crítico, el usuario puede logearse manualmente
  }

  return { success: true, redirectPath: '/super-admin' }
}
