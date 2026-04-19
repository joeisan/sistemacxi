'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/mail/send-email'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().uuid()
})

export async function registerClient(data: z.infer<typeof registerSchema>) {
  const supabase = await createClient()

  // 1. Validate inputs
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }

  const { firstName, lastName, email, phone, password, tenantId } = parsed.data
  const fullName = `${firstName} ${lastName}`

  // Service Role client for admin operations
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // 2. Create user with email auto-confirmed
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      tenant_id: tenantId,
      role: 'client'
    }
  })

  if (authError || !authData.user) {
    console.error('Error auth:', authError)
    return { success: false, error: authError?.message || 'Error al crear usuario' }
  }

  const userId = authData.user.id

  // 3. Create Profile
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: userId,
      tenant_id: tenantId,
      email: email,
      full_name: fullName,
      phone: phone,
      role: 'client'
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    return { success: false, error: 'Error creando perfil del usuario' }
  }

  // 4. Verify Tenant Config (Hard Block)
  const [{ data: plansCountData }, { data: settingsData }] = await Promise.all([
    adminClient.from('pricing_plans').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    adminClient.from('tenant_settings').select('client_code_prefix, locker_address_line_1').eq('tenant_id', tenantId).single()
  ])

  if (!plansCountData || plansCountData.length < 1) {
    return { success: false, error: 'El administrador aún no ha configurado planes de cobro.' }
  }

  if (!settingsData?.client_code_prefix || !settingsData?.locker_address_line_1) {
    return { success: false, error: 'El administrador aún no ha configurado la dirección del casillero.' }
  }

  // 5. Generate Client Code via Postgres RPC
  const { data: rpcData, error: rpcError } = await adminClient
    .rpc('generate_client_code', { p_tenant_id: tenantId })
    .single()

  if (rpcError) {
    console.error('Error generating client code:', rpcError)
    return { success: false, error: 'Error generando código de casillero' }
  }

  const result = rpcData as { v_code: string; v_seq: number }
  const clientCode = result.v_code
  const sequenceNumber = result.v_seq

  // 5. Create Client Record
  const { error: clientError } = await adminClient
    .from('clients')
    .insert({
      tenant_id: tenantId,
      profile_id: userId,
      client_code: clientCode,
      sequence_number: sequenceNumber,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone: phone
    })

  if (clientError) {
    console.error('Error creating client:', clientError)
    return { success: false, error: 'Error configurando casillero del cliente' }
  }

  // 6. Auto-login the new client
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    console.error('Auto-login error:', loginError)
  }

  // 7. Send Welcome Email (Simulated)
  try {
    await sendEmail({
      to: [email],
      subject: `¡Bienvenido a tu casillero! - Código: ${clientCode}`,
      html: `<h1>Hola ${firstName}</h1><p>Tu casillero ha sido creado exitosamente.</p><p>Tu código único es: <strong>${clientCode}</strong></p>`
    })
  } catch (emailError) {
    console.error('Error sending welcome email:', emailError)
  }

  return { 
    success: true, 
    data: { clientCode } 
  }
}
