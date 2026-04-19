'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { ReactNode } from 'react'

export function LogoutButton({ 
  tenantSlug, 
  className = "", 
  children 
}: { 
  tenantSlug?: string, 
  className?: string,
  children?: ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await supabase.auth.signOut()
    router.push(tenantSlug ? `/${tenantSlug}` : '/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children || (
        <>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </>
      )}
    </button>
  )
}
