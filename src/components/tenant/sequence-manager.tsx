'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTenantSettings } from '@/app/actions/admin/update-tenant-settings'
import { toast } from 'sonner'
import { Hash, Type, Layout } from 'lucide-react'

interface SequenceManagerProps {
  tenantId: string
  currentSequence: number
  prefix: string
  suffix: string
  isReadOnly?: boolean
}

export function SequenceManager({ tenantId, currentSequence, prefix, suffix, isReadOnly }: SequenceManagerProps) {
  const [newVal, setNewVal] = useState((currentSequence + 1).toString())
  const [newPrefix, setNewPrefix] = useState(prefix || '')
  const [newSuffix, setNewSuffix] = useState(suffix || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    const num = parseInt(newVal)
    if (isNaN(num)) return
    
    setIsLoading(true)
    try {
      const result = await updateTenantSettings({
        tenantId,
        newSequence: num,
        prefix: newPrefix,
        suffix: newSuffix
      })
      if (result.success) {
        toast.success(`Configuración de códigos actualizada`)
      } else {
        toast.error('Error al actualizar configuración')
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  // Previsualización del código
  const previewCode = `${newPrefix}${newVal.padStart(4, '0')}${newSuffix}`

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Ejemplo del Próximo Código</span>
          <span className="text-3xl font-mono font-black text-primary tracking-tighter">{previewCode}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                <Type className="h-3 w-3" />
                Prefijo
            </Label>
            <Input 
                value={newPrefix} 
                onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                placeholder="BOX"
                className="font-mono"
                disabled={isReadOnly}
            />
        </div>
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                <Hash className="h-3 w-3" />
                Siguiente Número
            </Label>
            <Input 
                type="number" 
                value={newVal} 
                onChange={(e) => setNewVal(e.target.value)}
                className="font-mono"
                disabled={isReadOnly}
            />
        </div>
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                <Layout className="h-3 w-3" />
                Sufijo (Opcional)
            </Label>
            <Input 
                value={newSuffix} 
                onChange={(e) => setNewSuffix(e.target.value.toUpperCase())}
                placeholder=""
                className="font-mono"
                disabled={isReadOnly}
            />
        </div>
      </div>

      <Button onClick={handleUpdate} disabled={isLoading || isReadOnly} className="w-full font-bold">
        {isLoading ? 'Guardando Cambios...' : 'Guardar Configuración de Códigos'}
      </Button>

      <p className="text-xs text-muted-foreground text-center italic">
        * Al guardar, los nuevos clientes registrados usarán este formato de código automáticamente.
      </p>
    </div>
  )
}
