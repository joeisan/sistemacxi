'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { updateClient } from '@/app/actions/admin/update-client'
import { toast } from 'sonner'

interface Client {
  id: string
  full_name: string
  phone: string
  client_code: string
  plan_id: string | null
}

interface Plan {
    id: string
    name: string
}

interface EditClientDialogProps {
    client: Client
    availablePlans: Plan[]
}

export function EditClientDialog({ client, availablePlans }: EditClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: client.full_name,
    phone: client.phone || '',
    clientCode: client.client_code,
    planId: client.plan_id || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateClient({
        id: client.id,
        fullName: formData.fullName,
        phone: formData.phone,
        clientCode: formData.clientCode,
        planId: formData.planId || null
      })

      if (result.success) {
        toast.success('Cliente actualizado correctamente')
        setOpen(false)
      } else {
        toast.error('Error', { description: result.error })
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica los datos del cliente y asigna su plan de cobro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.clientCode}
                onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                className="font-mono font-bold"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plan">Plan de Cobro</Label>
              <Select 
                value={formData.planId} 
                onValueChange={(v) => v && setFormData({ ...formData, planId: v })}
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Seleccionar un plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
