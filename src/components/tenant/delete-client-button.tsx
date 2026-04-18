'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteClient } from '@/app/actions/tenant/delete-client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup
} from "@/components/super-admin/delete-tenant-button"

// Reutilizamos la estructura del diálogo de borrado
export function DeleteClientButton({ 
  clientId, 
  clientName, 
  tenantSubdomain 
}: { 
  clientId: string, 
  clientName: string,
  tenantSubdomain: string
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteClient(clientId, tenantSubdomain)
      if (result.success) {
        toast.success(`Cliente "${clientName}" eliminado correctamente.`)
        setOpen(false)
      } else {
        toast.error('Error al eliminar', { description: result.error })
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      } />
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">¿Eliminar Cliente?</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Esta acción eliminará permanentemente a <strong>{clientName}</strong> y todos sus paquetes registrados. Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="font-bold">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar Cliente'}
            </Button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
