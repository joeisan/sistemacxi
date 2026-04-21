'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/auth/action-auth'
import { revalidatePath } from 'next/cache'

/**
 * Deletes a user globally from Auth and the Profiles table.
 * Restricted to Super Admins (enforced via Supabase Service Role usage and server-side checks).
 */
export async function deleteUserGlobal(userId: string) {
  const auth = await requireSuperAdmin()
  if (!auth.ok) {
    return { success: false, error: auth.error }
  }

  const adminClient = createAdminClient()

  console.log(`--- INITIATING GLOBAL USER DELETION: ${userId} ---`)

  try {
    // 1. Delete from Auth (This will trigger profile deletion if cascade is set, 
    // but in Supabase Auth usually it's better to be explicit or rely on triggers)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return { success: false, error: authError.message }
    }

    // 2. Explicitly delete from profiles just in case (Auth deletion doesn't always cascade to public schema automatically)
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.warn('Profile deletion error (might have already been deleted by trigger):', profileError)
      // We don't return error here if auth deletion succeeded, as the user is effectively gone.
    }

    console.log(`--- USER ${userId} DELETED SUCCESSFULLY ---`)
    revalidatePath('/super-admin/usuarios')
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    console.error('Unexpected error during user deletion:', err)
    return { success: false, error: message }
  }
}
