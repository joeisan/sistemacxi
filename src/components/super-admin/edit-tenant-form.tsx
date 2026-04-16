'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Switch } from '@/components/ui/switch'
import { updateTenant } from '@/app/actions/super-admin/update-tenant'
import { toast } from 'sonner'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface EditTenantFormProps {
  tenant: {
    id: string
    name: string
    subdomain: string
    plan_type: string
    plan_expiry_date: string | null
    is_active: boolean
  }
}

export function EditTenantForm({ tenant }: EditTenantFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: tenant.name,
    plan_type: tenant.plan_type,
    plan_expiry_date: tenant.plan_expiry_date ? tenant.plan_expiry_date.split('T')[0] : '',
    is_active: tenant.is_active,
  })

  const calculateExpiryDate = (planType: string) => {
    const now = new Date()
    let daysToAdd = 0

    switch (planType) {
      case 'prueba':
        daysToAdd = 15
        break
      case 'mensual':
        daysToAdd = 30
        break
      case 'anual':
        daysToAdd = 365
        break
      case 'gratis':
        daysToAdd = 365 * 10 // 10 años
        break
      default:
        return ''
    }

    now.setDate(now.getDate() + daysToAdd)
    return now.toISOString().split('T')[0]
  }

  const handlePlanChange = (newPlan: string | null) => {
    if (!newPlan) return
    const newExpiry = calculateExpiryDate(newPlan)
    setFormData((prev) => ({
      ...prev,
      plan_type: newPlan,
      plan_expiry_date: newExpiry
    }))
    toast.info(`Fecha de expiración sugerida para plan ${newPlan}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = await updateTenant(tenant.id, {
      ...formData,
      plan_expiry_date: formData.plan_expiry_date || null
    })

    if (result.success) {
      toast.success('Empresa actualizada correctamente')
      router.push('/super-admin/tenants')
      router.refresh()
    } else {
      toast.error('Error: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Editar Detalles de Empresa</CardTitle>
          <Link href="/super-admin/tenants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Empresa</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdominio (solo lectura)</Label>
              <Input id="subdomain" value={tenant.subdomain} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_type">Tipo de Plan</Label>
              <Select 
                value={formData.plan_type} 
                onValueChange={handlePlanChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="prueba">Prueba (15 días)</SelectItem>
                  <SelectItem value="gratis">Gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan_expiry_date">Fecha de Expiración</Label>
            <Input 
              id="plan_expiry_date" 
              type="date"
              value={formData.plan_expiry_date} 
              onChange={(e) => setFormData({ ...formData, plan_expiry_date: e.target.value })}
            />
            <p className="text-xs text-muted-foreground italic">
              El administrador verá un aviso 4 días antes de esta fecha.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-muted">
            <div className="space-y-0.5">
              <Label className="text-base">Estado de Cuenta</Label>
              <p className="text-sm text-muted-foreground">
                Desactiva para bloquear el acceso total a esta empresa.
              </p>
            </div>
            <Switch 
              checked={formData.is_active} 
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-6 bg-muted/20">
          <Link href="/super-admin/tenants">
            <Button variant="outline" type="button" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
