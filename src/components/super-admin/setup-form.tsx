'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { setupSuperAdmin } from '@/app/actions/auth/setup-super-admin'

const setupSchema = z.object({
  firstName: z.string().min(2, 'Obligatorio'),
  lastName: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Min 6 caracteres')
})

type FormData = z.infer<typeof setupSchema>

export function SetupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(setupSchema)
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await setupSuperAdmin(data)
      
      if (!result.success || !result.redirectPath) {
        toast.error('Atención', {
          description: result.error || 'Error de configuración.'
        });
        setIsLoading(false)
        return;
      }
      
      toast.success('Administrador global creado con éxito. Redirigiendo...');
      router.push(result.redirectPath)
      
    } catch (error) {
      toast.error('Error Crítico', {
        description: 'Error de servidor. Revisa la consola.'
      });
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card shadow-lg border rounded-xl p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" disabled={isLoading} {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" disabled={isLoading} {...register('lastName')} />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico maestro</Label>
          <Input id="email" type="email" disabled={isLoading} {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña segura</Label>
          <Input id="password" type="password" disabled={isLoading} {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full h-12 mt-4 text-base font-semibold">
          {isLoading ? 'Creando...' : 'Crear Super Administrador'}
        </Button>
      </form>
    </div>
  )
}
