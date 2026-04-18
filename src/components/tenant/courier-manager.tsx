'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { addCourier, deleteCourier } from '@/app/actions/admin/manage-couriers'

interface Courier {
  id: string
  name: string
  is_active: boolean
}

export function CourierManager({ tenantId, initialCouriers, isReadOnly }: { tenantId: string, initialCouriers: Courier[], isReadOnly?: boolean }) {
  const [couriers, setCouriers] = useState<Courier[]>(initialCouriers)
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsLoading(true)
    try {
      const result = await addCourier({ tenantId, name: newName.trim() })
      if (result.success) {
        toast.success(`Courier "${newName}" agregado`)
        setNewName('')
        window.location.reload()
      } else {
        toast.error('Error', { description: result.error })
      }
    } catch (err) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la transportadora "${name}"?`)) return

    setIsLoading(true)
    try {
      const result = await deleteCourier(id)
      if (result.success) {
        toast.success(`Courier "${name}" eliminado`)
        setCouriers(prev => prev.filter(c => c.id !== id))
      } else {
        toast.error('Error', { description: result.error })
      }
    } catch (err) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="courierName">Nombre de la transportadora</Label>
          <Input
            id="courierName"
            placeholder="Ej: Amazon, UPS, FedEx, DHL..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            disabled={isReadOnly}
          />
        </div>
        <Button type="submit" disabled={isLoading || !newName.trim() || isReadOnly}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </form>

      {couriers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {couriers.map((courier) => (
            <div
              key={courier.id}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm transition-all hover:shadow-md"
            >
              <Truck className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium">{courier.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(courier.id, courier.name)}
                className="ml-1 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                disabled={isLoading || isReadOnly}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center border rounded-lg bg-muted/20">
          <Truck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground italic">
            No hay transportadoras configuradas. Agrega las que uses frecuentemente.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Por defecto: Amazon, UPS, FedEx, DHL, USPS
          </p>
        </div>
      )}
    </div>
  )
}
