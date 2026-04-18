'use client'

import * as React from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteTenant } from '@/app/actions/super-admin/delete-tenant'
import { toast } from 'sonner'
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from '@/lib/utils'

// Componentes exportados para reutilización (estilo Shadcn/Base-UI)
export function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />
}

export function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...props} />
}

export function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal {...props} />
}

export function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop 
      className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0", className)} 
      {...props} 
    />
  )
}

export function DialogPopup({ className, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Popup 
      className={cn("fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-2xl transition duration-200 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95", className)} 
      {...props} 
    />
  )
}

export function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title 
      className={cn("text-center text-xl font-bold", className)} 
      {...props} 
    />
  )
}

export function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description 
      className={cn("text-center text-muted-foreground", className)} 
      {...props} 
    />
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />
}

// Botón Principal
export function DeleteTenantButton({ tenantId, tenantName }: { tenantId: string, tenantName: string }) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteTenant(tenantId)
      if (result.success) {
        toast.success(`Empresa "${tenantName}" eliminada correctamente.`)
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
            <DialogTitle>¿Eliminar Empresa?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente a <strong>{tenantName}</strong>, incluyendo todos sus clientes, paquetes y configuraciones. Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="font-bold">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar Todo'}
            </Button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
