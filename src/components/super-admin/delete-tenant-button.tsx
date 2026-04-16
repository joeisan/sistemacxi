'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteTenant } from '@/app/actions/super-admin/delete-tenant'
import { toast } from 'sonner'

export function DeleteTenantButton({ tenantId, tenantName }: { tenantId: string, tenantName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTenant(tenantId)
    
    if (result.success) {
      toast.success('Empresa eliminada correctamente')
    } else {
      toast.error('Error al eliminar', { description: result.error })
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => {
        if (confirm(`¿Estás seguro de eliminar "${tenantName}"? Esta acción no se puede deshacer.`)) {
          handleDelete()
        }
      }}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      {isDeleting ? 'Borrando...' : 'Eliminar'}
    </Button>
  )
}
