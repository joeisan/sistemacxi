'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { deleteUserGlobal } from '@/app/actions/super-admin/delete-user'

interface DeleteUserDialogProps {
  userId: string
  userEmail: string
  userName: string
}

export function DeleteUserDialog({ userId, userEmail, userName }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')

  const isConfirmed = confirmEmail.toLowerCase() === userEmail.toLowerCase()

  const handleDelete = async () => {
    if (!isConfirmed) return

    setIsLoading(true)
    try {
      const result = await deleteUserGlobal(userId)
      if (result.success) {
        toast.success(`Usuario ${userName} eliminado exitosamente.`)
        setOpen(false)
      } else {
        toast.error('Error al eliminar', { description: result.error })
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Eliminación Permanente</DialogTitle>
          </div>
          <DialogDescription className="space-y-3">
            <p>
              Estás a punto de borrar a <strong>{userName}</strong> ({userEmail}). 
              Esta acción es <strong>irreversible</strong> y eliminará su cuenta de acceso y perfil.
            </p>
            <p className="text-xs font-bold bg-destructive/10 p-2 rounded border border-destructive/20 text-destructive">
              ADVERTENCIA: Si este usuario es el único administrador de una empresa, la empresa quedará huérfana.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-email" className="text-xs uppercase font-black tracking-widest text-muted-foreground">
              Confirmar Email del Usuario
            </Label>
            <Input
              id="confirm-email"
              placeholder={userEmail}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className={confirmEmail && !isConfirmed ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={isLoading}
            />
            <p className="text-[10px] text-muted-foreground italic">
              Escribe el correo electrónico exacto para habilitar la eliminación.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={!isConfirmed || isLoading}
            className="font-bold flex gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Eliminar Definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
