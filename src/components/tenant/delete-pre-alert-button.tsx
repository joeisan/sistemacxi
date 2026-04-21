'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deletePreAlert } from '@/app/actions/client/package-actions'
import { toast } from 'sonner'

export function DeletePreAlertButton({ packageId }: { packageId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar este pre-alerta?')) return

    setIsLoading(true)
    try {
      const result = await deletePreAlert()
      
      if (result.success) {
        toast.success('Pre-alerta eliminada')
      } else {
        toast.error('Error al eliminar', { description: result.error })
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      onClick={handleDelete}
      disabled={isLoading}
      title={`No disponible para ${packageId}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
