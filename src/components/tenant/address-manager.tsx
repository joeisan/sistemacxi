'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil, CheckCircle2, MapPin, Phone, Building2 } from 'lucide-react'
import { upsertTenantAddress, deleteTenantAddress } from '@/app/actions/admin/manage-addresses'
import { toast } from 'sonner'
import { DataTableResponsive, ColumnDef } from '@/components/ui/data-table-responsive'

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
        resetForm()
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

  const columns: ColumnDef<Address>[] = [
    {
      header: 'Sede',
      render: (a) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
            {a.label}
            {a.is_default && <CheckCircle2 className="h-3 w-3 text-primary" />}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter flex items-center gap-1">
            <Phone className="h-2.5 w-2.5" /> {a.phone}
          </span>
        </div>
      ),
      priority: true
    },
    {
      header: 'Dirección Completa',
      render: (a) => (
        <div className="flex flex-col text-xs font-medium">
          <span className="text-foreground">{a.address_line_1}</span>
          <span className="text-muted-foreground opacity-70">{a.city_state_zip}, {a.country}</span>
        </div>
      ),
      priority: true
    },
    {
      header: 'Estado',
      render: (a) => (
        <Badge variant={a.is_default ? "default" : "outline"} className={`text-[9px] font-black uppercase h-5 border-none ${a.is_default ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {a.is_default ? "Principal" : "Opcional"}
        </Badge>
      ),
      className: 'text-center'
    }
  ]

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <form onSubmit={handleSave} className="bg-card rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-primary/5 bg-primary/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                  {isEditing ? 'Editar Dirección' : 'Nueva Sede Operativa'}
              </h3>
            </div>
            {isEditing && (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-[10px] h-8 font-black uppercase px-3">
                  Cerrar Edición
                </Button>
            )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Nombre de la Sede</Label>
                <Input id="label" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} 
                  placeholder="Ej: Almacén Principal Miami" required className="bg-muted/30 border-none font-bold placeholder:font-normal placeholder:opacity-50" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Teléfono Contacto</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+1 (000) 000-0000" required className="bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Dirección Física (Línea 1)</Label>
                <Input id="address" value={formData.address_line_1} onChange={e => setFormData({...formData, address_line_1: e.target.value})} 
                  placeholder="Ej: 8200 NW 12TH ST" required className="bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Ciudad, Estado y ZIP</Label>
                <Input id="city" value={formData.city_state_zip} onChange={e => setFormData({...formData, city_state_zip: e.target.value})} 
                  placeholder="Ej: MIAMI, FL 33126" required className="bg-muted/30 border-none font-bold" />
            </div>
            <div className="flex items-center gap-6 md:col-span-2">
                <div className="flex items-center gap-2 pr-6 border-r border-dotted">
                    <input type="checkbox" id="default" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})}
                      className="h-5 w-5 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20 bg-muted/30" />
                    <Label htmlFor="default" className="text-[11px] font-black uppercase tracking-tighter text-foreground">Sede Predeterminada</Label>
                </div>
                <Button type="submit" disabled={isLoading} className="flex-1 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-xs h-11">
                    {isLoading ? 'Procesando...' : (isEditing ? 'Actualizar Dirección' : 'Registrar Sede')}
                </Button>
            </div>
        </div>
      </form>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Sedes Configuradas</h4>
        <DataTableResponsive
          data={addresses}
          columns={columns}
          rowId={(a) => a.id}
          mobileConfig={{
            title: (a) => a.label,
            subtitle: (a) => a.address_line_1,
            badge: (a) => a.is_default && (
              <Badge variant="default" className="text-[8px] h-4 bg-primary/10 text-primary border-none uppercase font-black">
                Ppal
              </Badge>
            )
          }}
          actions={(a) => (
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(true); setFormData(a); }} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/5">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          )}
          emptyMessage="No has configurado sedes todavía."
        />
      </div>
    </div>
  )
}
