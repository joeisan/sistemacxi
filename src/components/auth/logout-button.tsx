'use client'

import { logout } from '@/app/actions/auth/logout'
import { LogOut } from 'lucide-react'
import { useTransition } from 'react'
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
  const [isPending, startTransition] = useTransition()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await logout(tenantSlug)
    })
  }

  return (
    <button onClick={handleLogout} className={className} disabled={isPending}>
      {children || (
        <>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </>
      )}
    </button>
  )
}
