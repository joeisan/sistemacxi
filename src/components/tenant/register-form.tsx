'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

import { registerClient } from '@/app/actions/auth/register-client'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof registerSchema>

export function RegisterForm({ tenantId, tenantName, tenantSlug }: { tenantId: string, tenantName: string, tenantSlug: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await registerClient({ ...data, tenantId })
      
      if (!result.success) {
        toast.error('Error', {
          description: result.error || 'Ocurrió un error en el registro.'
        });
        return;
      }
      
      toast.success('¡Registro exitoso!', {
        description: `Tu casillero ${result.data?.clientCode} ha sido creado. Redirigiendo al inicio de sesión...`
      });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push(`/${tenantSlug}/login`)
      }, 2000)
      
    } catch (error) {
      toast.error('Error', {
        description: 'Error de servidor al intentar registrarte.'
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" placeholder="Juan" {...register('firstName')} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" placeholder="Pérez" {...register('lastName')} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" placeholder="juan@correo.com" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" type="tel" placeholder="+1 234 567 8900" {...register('phone')} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Crea una contraseña</Label>
        <PasswordInput id="password" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      
      <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Crear Casillero'}
      </Button>
    </form>
  )
}
