'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { toggleTenantStatus } from '@/app/actions/super-admin/manage-tenant'
import { toast } from 'sonner'

interface StatusToggleButtonProps {
  tenantId: string
  initialStatus: boolean
}

export function StatusToggleButton({ tenantId, initialStatus }: StatusToggleButtonProps) {
  const [isActive, setIsActive] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const result = await toggleTenantStatus(tenantId, isActive)
      if (result.success) {
        setIsActive(!isActive)
        toast.success(isActive ? 'Empresa bloqueada' : 'Empresa activada')
      } else {
        toast.error('Error al cambiar estado')
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch 
        checked={isActive} 
        onCheckedChange={handleToggle} 
        disabled={isLoading}
      />
      <span className="text-xs font-medium w-12">
        {isActive ? 'Activo' : 'Bloqueado'}
      </span>
    </div>
  )
}
