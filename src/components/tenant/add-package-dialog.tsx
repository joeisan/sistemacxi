'use client'

import { useState, useEffect } from 'react'
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
import { Plus, Package, Loader2 } from "lucide-react"
import { createPreAlert } from "@/app/actions/client/package-actions"
import { toast } from "sonner"

interface AddPackageDialogProps {
  tenantId: string
  clientId: string
  initialTracking?: string
  onSuccess?: () => void
  trigger?: React.ReactElement
}

export function AddPackageDialog({ 
  tenantId, 
  clientId, 
  initialTracking = '', 
  onSuccess,
  trigger
}: AddPackageDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    trackingNumber: initialTracking,
    courierName: '',
    description: ''
  })

  // Sincronizar si cambia el tracking inicial (desde el historial de rastreo)
  useEffect(() => {
    if (initialTracking) {
      setFormData(prev => ({ ...prev, trackingNumber: initialTracking }))
    }
  }, [initialTracking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.trackingNumber || !formData.courierName) return

    setIsLoading(true)
    try {
      const result = await createPreAlert({
        tenantId,
        clientId,
        ...formData
      })

      if (result.success) {
        toast.success('Paquete pre-alertado correctamente')
        setFormData({ trackingNumber: '', courierName: '', description: '' })
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error('Error al registrar el paquete')
      }
    } catch (err) {
      toast.error('Error de red')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Pre-alertar Paquete
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Pre-alertar Paquete
            </DialogTitle>
            <DialogDescription>
              Registra tu paquete antes de que llegue a Miami para un procesamiento más rápido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tracking">Número de Tracking</Label>
              <Input
                id="tracking"
                placeholder="Ej: 1Z999..."
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="courier">Courier / Transportadora</Label>
              <Input
                id="courier"
                placeholder="Ej: UPS, FedEx, Amazon..."
                value={formData.courierName}
                onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Input
                id="description"
                placeholder="¿Qué hay dentro?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Paquete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
