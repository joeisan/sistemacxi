'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Lock, Mail, Loader2 } from 'lucide-react'

interface ProfileFormProps {
  initialData: {
    fullName: string
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const supabase = createClient()

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newPassword || newPassword.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres')
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Las contraseñas no coinciden')
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      
      toast.success('Contraseña actualizada correctamente')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Datos de la Cuenta
          </CardTitle>
          <CardDescription>
            Información básica de tu perfil de usuario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={initialData.fullName} readOnly className="pl-10 bg-muted/50" />
            </div>
            <p className="text-[10px] text-muted-foreground italic">Ponte en contacto con soporte si necesitas cambiar tu nombre.</p>
          </div>
          
          <div className="space-y-2">
            <Label>Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={initialData.email} readOnly className="pl-10 bg-muted/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad / Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
