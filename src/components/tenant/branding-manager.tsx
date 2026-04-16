'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTenantBranding } from '@/app/actions/admin/update-tenant-settings'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'

interface BrandingManagerProps {
  tenantId: string
  initialName: string
  primaryColor: string
  secondaryColor: string
}

export function BrandingManager({ tenantId, initialName, primaryColor, secondaryColor }: BrandingManagerProps) {
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    if (!name.trim()) return
    
    setIsLoading(true)
    try {
      const result = await updateTenantBranding(tenantId, name)
      if (result.success) {
        toast.success(`Nombre de empresa actualizado`)
      } else {
        toast.error('Error al actualizar nombre')
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
          <Building2 className="h-3 w-3" />
          Nombre de la Empresa
        </Label>
        <div className="flex gap-2">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi Courier S.A.S"
            className="flex-1"
          />
          <Button onClick={handleUpdate} disabled={isLoading || name === initialName}>
            {isLoading ? '...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 pt-2 border-t">
          <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Color Primario</span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full shadow-inner ring-2 ring-background ring-offset-2 ring-offset-primary/20" style={{ backgroundColor: primaryColor }} />
                <span className="text-xs font-mono font-bold uppercase">{primaryColor}</span>
              </div>
          </div>
          <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Color Secundario</span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full shadow-inner ring-2 ring-background ring-offset-2 ring-offset-secondary/20" style={{ backgroundColor: secondaryColor }} />
                <span className="text-xs font-mono font-bold uppercase">{secondaryColor}</span>
              </div>
          </div>
      </div>
      
      <p className="text-[10px] text-muted-foreground italic">
        * Para cambiar los colores y el logo, por favor contacte a soporte técnico.
      </p>
    </div>
  )
}
