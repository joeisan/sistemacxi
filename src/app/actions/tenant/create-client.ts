'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'

const createClientSchema = z.object({
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().min(5, 'Teléfono obligatorio'),
  password: z.string().min(6, 'Contraseña de al menos 6 caracteres'),
  tenantId: z.string().uuid(),
  planId: z.string().uuid().optional(),
})

export async function createClientByAdmin(data: z.infer<typeof createClientSchema>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!url || !serviceKey) {
    return { success: false, error: 'Configuración del servidor incompleta.' }
  }

  const adminClient = createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const parsed = createClientSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { firstName, lastName, email, phone, password, tenantId, planId } = parsed.data
  const fullName = `${firstName} ${lastName}`

  try {
    // 0. Verificar si el tenant está expirado o inactivo
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (!tenant || !tenant.is_active || isTenantExpired(tenant)) {
      return { 
        success: false, 
        error: !tenant?.is_active 
          ? 'La empresa está suspendida.' 
          : 'Tu plan ha expirado. El sistema está en MODO LECTURA.' 
      }
    }

    // 1. Verificar si el correo ya existe
    const { data: existingUser } = await adminClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return { success: false, error: 'El correo electrónico ya está registrado.' }
    }

    // 2. Crear usuario en Auth (Auto-confirmado)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'client',
        full_name: fullName,
        tenant_id: tenantId
      }
    })

    if (authError || !authData.user) {
      throw new Error(`Error Auth: ${authError?.message || 'Usuario no creado'}`)
    }

    const userId = authData.user.id

    // 3. Crear Perfil
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        tenant_id: tenantId,
        email,
        full_name: fullName,
        phone,
        role: 'client',
        is_active: true
      })

    if (profileError) throw new Error(`Error Perfil: ${profileError.message}`)

    // 4. Generar Código de Cliente (RPC)
    const { data: rpcData, error: rpcError } = await adminClient
      .rpc('generate_client_code', { p_tenant_id: tenantId })
      .single()

    if (rpcError) throw new Error(`Error RPC: ${rpcError.message}`)
    
    const { v_code: clientCode, v_seq: sequenceNumber } = rpcData as { v_code: string; v_seq: number }

    // 5. Crear Registro de Cliente
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
        phone,
        plan_id: planId
      })

    if (clientError) throw new Error(`Error Cliente: ${clientError.message}`)

    revalidatePath('/[tenant]/admin/clientes', 'page')
    
    return { success: true, clientCode }
  } catch (error: any) {
    console.error('Error creating client:', error)
    return { success: false, error: error.message }
  }
}
