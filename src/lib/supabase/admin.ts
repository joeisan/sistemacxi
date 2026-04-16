import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the Service Role Key.
 * This bypasses all RLS policies. Use ONLY on the server side
 * for admin operations (Super Admin pages, server actions, etc.)
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
