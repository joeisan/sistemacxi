'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTenantBranding } from '@/app/actions/admin/update-tenant-settings'
import { toast } from 'sonner'
import { Building2, Palette, Save } from 'lucide-react'

interface BrandingManagerProps {
  tenantId: string
  initialName: string
  primaryColor: string
  secondaryColor: string
  isReadOnly?: boolean
}

export function BrandingManager({ tenantId, initialName, primaryColor, secondaryColor, isReadOnly }: BrandingManagerProps) {
  const [name, setName] = useState(initialName)
  const [primary, setPrimary] = useState(primaryColor)
  const [secondary, setSecondary] = useState(secondaryColor)
  const [isLoading, setIsLoading] = useState(false)

  const hasChanges = name !== initialName || primary !== primaryColor || secondary !== secondaryColor

  const handleUpdate = async () => {
    if (!name.trim()) return
    
    setIsLoading(true)
    try {
      const result = await updateTenantBranding(tenantId, name, primary, secondary)
      if (result.success) {
        toast.success(`Identidad corporativa actualizada`)
      } else {
        toast.error('Error al actualizar')
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const PRESET_COLORS = [
    '#4F46E5', // Indigo
    '#0EA5E9', // Sky
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#000000', // Black
    '#6B7280', // Gray
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Nombre de Empresa */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
          <Building2 className="h-3.5 w-3.5" />
          Nombre de la Empresa
        </Label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Mi Courier S.A.S"
          className="text-base font-semibold"
          disabled={isReadOnly}
        />
      </div>

      {/* Colores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
        {/* Color Primario */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
            <Palette className="h-3.5 w-3.5" />
            Color Primario
          </Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="color" 
                value={primary} 
                onChange={(e) => setPrimary(e.target.value)}
                className="h-12 w-12 rounded-xl cursor-pointer border-2 border-border shadow-sm hover:shadow-md transition-shadow"
                style={{ padding: 0 }}
              />
            </div>
            <Input 
              value={primary} 
              onChange={(e) => setPrimary(e.target.value)}
              placeholder="#000000"
              className="font-mono font-bold text-sm uppercase flex-1"
              maxLength={7}
              disabled={isReadOnly}
            />
          </div>
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={`primary-${color}`}
                type="button"
                onClick={() => setPrimary(color)}
                className={`h-7 w-7 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${primary === color ? 'border-foreground ring-2 ring-foreground/20 scale-110' : 'border-transparent hover:border-muted-foreground/30'}`}
                style={{ backgroundColor: color }}
                title={color}
                disabled={isReadOnly}
              />
            ))}
          </div>
        </div>

        {/* Color Secundario */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
            <Palette className="h-3.5 w-3.5" />
            Color Secundario
          </Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="color" 
                value={secondary} 
                onChange={(e) => setSecondary(e.target.value)}
                className="h-12 w-12 rounded-xl cursor-pointer border-2 border-border shadow-sm hover:shadow-md transition-shadow"
                style={{ padding: 0 }}
                disabled={isReadOnly}
              />
            </div>
            <Input 
              value={secondary} 
              onChange={(e) => setSecondary(e.target.value)}
              placeholder="#ffffff"
              className="font-mono font-bold text-sm uppercase flex-1"
              maxLength={7}
              disabled={isReadOnly}
            />
          </div>
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={`secondary-${color}`}
                type="button"
                onClick={() => setSecondary(color)}
                className={`h-7 w-7 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${secondary === color ? 'border-foreground ring-2 ring-foreground/20 scale-110' : 'border-transparent hover:border-muted-foreground/30'}`}
                style={{ backgroundColor: color }}
                title={color}
                disabled={isReadOnly}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vista Previa de Marca</span>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl shadow-lg flex items-center justify-center text-white text-xl font-black" style={{ backgroundColor: primary }}>
            {name?.charAt(0)?.toUpperCase() || 'E'}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-black tracking-tight" style={{ color: primary }}>{name || 'Mi Empresa'}</span>
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 rounded-full" style={{ backgroundColor: primary }} />
              <div className="h-3 w-12 rounded-full" style={{ backgroundColor: secondary }} />
            </div>
          </div>
        </div>
      </div>

      {/* Guardar */}
      <Button 
        onClick={handleUpdate} 
        disabled={isLoading || !hasChanges || isReadOnly}
        className="w-full sm:w-auto self-end shadow-lg shadow-primary/20 font-bold uppercase tracking-wider"
        size="lg"
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  )
}
