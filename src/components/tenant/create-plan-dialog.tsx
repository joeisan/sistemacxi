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
import { Plus, Pencil, Save, Trash2 } from 'lucide-react'
import { savePricingPlan, deletePricingPlan } from '@/app/actions/admin/manage-plans'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  cost_per_lb: number
  delivery_fee: number
}

interface CreatePlanDialogProps {
  tenantId: string
  plan?: Plan
}

export function CreatePlanDialog({ tenantId, plan }: CreatePlanDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    costPerLb: plan?.cost_per_lb || 0,
    deliveryFee: plan?.delivery_fee || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await savePricingPlan({
        id: plan?.id,
        tenantId,
        name: formData.name,
        costPerLb: Number(formData.costPerLb),
        deliveryFee: Number(formData.deliveryFee)
      })

      if (result.success) {
        toast.success(plan ? 'Plan actualizado' : 'Plan creado correctamente')
        setOpen(false)
        if (!plan) {
            setFormData({ name: '', costPerLb: 0, deliveryFee: 0 })
        }
      } else {
        toast.error('Error', { description: result.error })
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!plan?.id || !confirm('¿Estás seguro de eliminar este plan?')) return
    
    setIsLoading(true)
    try {
        const result = await deletePricingPlan(plan.id)
        if (result.success) {
            toast.success('Plan eliminado')
            setOpen(false)
        } else {
            toast.error('Error', { description: result.error })
        }
    } catch (error) {
        toast.error('Error al eliminar')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={plan ? (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
            </Button>
        ) : (
            <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
            </Button>
        )}
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{plan ? 'Editar Plan' : 'Nuevo Plan de Cobro'}</DialogTitle>
            <DialogDescription>
              Define el nombre del plan y los costos asociados por libra y envío.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Plan</Label>
              <Input
                id="name"
                placeholder="Ej. VIP, Estándar, Corporativo..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cost">Costo x Libra ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerLb}
                  onChange={(e) => setFormData({ ...formData, costPerLb: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery">Delivery ($)</Label>
                <Input
                  id="delivery"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
            {plan && (
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                    disabled={isLoading}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
            <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
