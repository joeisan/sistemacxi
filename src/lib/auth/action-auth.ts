import { createClient } from '@/lib/supabase/server'

interface ActionActor {
  id: string
  role: string
  tenantId: string | null
}

async function getActionActor(): Promise<ActionActor | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, tenant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: profile.id,
    role: profile.role,
    tenantId: profile.tenant_id,
  }
}

export async function requireSuperAdmin() {
  const actor = await getActionActor()

  if (!actor || actor.role !== 'super_admin') {
    return {
      ok: false as const,
      error: 'No autorizado.',
    }
  }

  return {
    ok: true as const,
    actor,
  }
}

export async function requireTenantAdmin(tenantId: string) {
  const actor = await getActionActor()

  if (!actor || actor.role !== 'admin' || actor.tenantId !== tenantId) {
    return {
      ok: false as const,
      error: 'No autorizado para operar sobre este tenant.',
    }
  }

  return {
    ok: true as const,
    actor,
  }
}
