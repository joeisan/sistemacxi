'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil, CheckCircle2 } from 'lucide-react'
import { upsertTenantAddress, deleteTenantAddress } from '@/app/actions/admin/manage-addresses'
import { toast } from 'sonner'

interface Address {
  id: string
  label: string
  address_line_1: string
  city_state_zip: string
  country: string
  phone: string
  is_default: boolean
}

export function AddressManager({ tenantId, initialAddresses }: { tenantId: string, initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Address>>({
    label: '',
    address_line_1: '',
    city_state_zip: '',
    country: 'United States',
    phone: '',
    is_default: false
  })

  const resetForm = () => {
    setFormData({
      label: '',
      address_line_1: '',
      city_state_zip: '',
      country: 'United States',
      phone: '',
      is_default: false
    })
    setIsEditing(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await upsertTenantAddress({
        tenantId,
        id: formData.id,
        label: formData.label!,
        addressLine1: formData.address_line_1!,
        cityStateZip: formData.city_state_zip!,
        country: formData.country!,
        phone: formData.phone!,
        isDefault: formData.is_default!
      })

      if (result.success) {
        toast.success(formData.id ? 'Dirección actualizada' : 'Dirección añadida')
        // In a real app we'd re-fetch or use the result, 
        // for now we rely on revalidatePath and the user can refresh or we can optimistically update
        resetForm()
        // Optimistic refresh (minimal)
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return

    setIsLoading(true)
    const result = await deleteTenantAddress(id, tenantId)
    if (result.success) {
      toast.success('Dirección eliminada')
      window.location.reload()
    } else {
      toast.error('Error', { description: result.error })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="grid gap-4 rounded-lg border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {isEditing ? 'Editar Sede' : 'Añadir Nueva Sede'}
            </h3>
            {isEditing && (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancelar</Button>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="label">Nombre de la Sede (ej: Florida Central)</Label>
                <Input 
                    id="label" 
                    value={formData.label} 
                    onChange={e => setFormData({...formData, label: e.target.value})}
                    placeholder="Miami Hub" 
                    required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Teléfono de la Sede</Label>
                <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 ..." 
                    required 
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección (Línea 1)</Label>
                <Input 
                    id="address" 
                    value={formData.address_line_1} 
                    onChange={e => setFormData({...formData, address_line_1: e.target.value})}
                    placeholder="6315 NW 99TH AVE" 
                    required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="city">Ciudad, Estado y ZIP</Label>
                <Input 
                    id="city" 
                    value={formData.city_state_zip} 
                    onChange={e => setFormData({...formData, city_state_zip: e.target.value})}
                    placeholder="DORAL, FL 33178" 
                    required 
                />
            </div>
            <div className="flex items-end gap-4">
                <div className="flex items-center space-x-2 h-10">
                    <input 
                        type="checkbox" 
                        id="default" 
                        checked={formData.is_default} 
                        onChange={e => setFormData({...formData, is_default: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="default">Sede Principal</Label>
                </div>
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Añadir')}
                </Button>
            </div>
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sede</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <TableRow key={address.id}>
                  <TableCell className="font-medium">
                    {address.label}
                    {address.is_default && (
                        <div className="flex items-center gap-1 text-[10px] text-primary mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Principal
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {address.address_line_1}, {address.city_state_zip}
                  </TableCell>
                  <TableCell>
                    <Badge variant={address.is_default ? "default" : "secondary"}>
                        {address.is_default ? "Activa" : "Opcional"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                                setIsEditing(true);
                                setFormData(address);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(address.id)}
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                  No hay sedes configuradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
