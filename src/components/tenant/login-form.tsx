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
import { loginUser } from '@/app/actions/auth/login'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Contraseña obligatoria')
})

type FormData = z.infer<typeof loginSchema>

export function LoginForm({ tenantSlug }: { tenantSlug: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await loginUser({ ...data, tenantSlug })
      
      if (!result.success || !result.redirectPath) {
        toast.error('Acceso denegado', {
          description: result.error || 'Credenciales inválidas.'
        });
        setIsLoading(false)
        return;
      }
      
      toast.success('¡Bienvenido de nuevo!');
      
      // Redirect based on role returned from server action
      router.push(result.redirectPath)
      
    } catch (error) {
      toast.error('Error', {
        description: 'Error de servidor al intentar acceder.'
      });
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-foreground/80">Correo electrónico</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="tu@correo.com" 
          className="h-12 bg-background/50 border-muted" 
          disabled={isLoading}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="font-medium text-foreground/80">Contraseña</Label>
          <Link href="/recuperar-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input 
          id="password" 
          type="password" 
          className="h-12 bg-background/50 border-muted" 
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-medium font-heading tracking-wide shadow-md shadow-primary/20 transition-all hover:scale-[1.01] hover:shadow-lg">
        {isLoading ? 'Comprobando...' : 'Iniciar Sesión'}
      </Button>
    </form>
  )
}
