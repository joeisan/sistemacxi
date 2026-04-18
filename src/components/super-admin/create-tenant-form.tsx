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
import { createTenantAndAdmin } from '@/app/actions/super-admin/create-tenant'

const formSchema = z.object({
  name: z.string().min(2, 'Obligatorio'),
  subdomain: z.string().min(2, 'Obligatorio (ej: mi-empresa)'),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  
  planType: z.enum(['monthly', 'annual']),
  planStartDate: z.string(),
  planExpiryDate: z.string().optional(),

  clientPrefix: z.string().min(2),
  address: z.string().min(5),
  cityStateZip: z.string().min(5),
  country: z.string().min(2),
  phone: z.string().min(5),

  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
})

type FormData = z.infer<typeof formSchema>

export function CreateTenantForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      primaryColor: '#2563eb',
      secondaryColor: '#f97316',
      planType: 'monthly',
      planStartDate: new Date().toISOString().split('T')[0],
      clientPrefix: '',
      address: '',
      cityStateZip: '',
      country: 'United States',
      phone: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const slug = data.subdomain.toLowerCase().replace(/\s+/g, '-')
      const result = await createTenantAndAdmin({
        ...data,
        slug,
        subdomain: slug,
      })

      console.log('Resultado:', result)

      if (!result.success) {
        toast.error('Error', { description: result.error })
        setIsLoading(false)
        return
      }
      toast.success('Empresa creada exitosamente.')
      setTimeout(() => {
        router.push('/super-admin/tenants')
      }, 500)
    } catch (error: any) {
      console.error('Error en onSubmit:', error)
      toast.error('Error de Servidor', { description: error.message })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">1. Datos de la Empresa y Plan</h3>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Nombre comercial</Label>
              <Input {...register('name')} placeholder="Mi Courier Express" />
              {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name.message}</p>}
           </div>
           <div className="space-y-2">
              <Label>URL/Subdominio</Label>
              <Input {...register('subdomain')} placeholder="micourier" />
              {errors.subdomain && <p className="text-[10px] text-destructive font-medium">{errors.subdomain.message}</p>}
           </div>
          <div className="space-y-2">
             <Label>Tipo de Plan</Label>
             <select 
               {...register('planType')} 
               className="w-full h-10 px-3 rounded-md border border-input bg-background"
             >
               <option value="monthly">Mensual</option>
               <option value="annual">Anual</option>
             </select>
          </div>
          <div className="space-y-2 text-primary">
             <Label>Fecha de Expiración (Opcional)</Label>
             <Input type="date" {...register('planExpiryDate')} />
             <p className="text-[10px] text-muted-foreground">Si se deja vacío, no habrá bloqueo automático.</p>
          </div>
          <div className="space-y-2">
             <Label>Color Primario</Label>
             <Input type="color" {...register('primaryColor')} className="w-full h-10 p-1 cursor-pointer" />
          </div>
          <div className="space-y-2">
             <Label>Color Secundario</Label>
             <Input type="color" {...register('secondaryColor')} className="w-full h-10 p-1 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">2. Configuración del Casillero en Miami</h3>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Prefijo para códigos (ej. MCE-)</Label>
              <Input {...register('clientPrefix')} placeholder="MCE-" />
              {errors.clientPrefix && <p className="text-[10px] text-destructive font-medium">{errors.clientPrefix.message}</p>}
           </div>
           <div className="space-y-2">
              <Label>Dirección (Línea 1)</Label>
              <Input {...register('address')} placeholder="1234 NW 12TH AVE" />
              {errors.address && <p className="text-[10px] text-destructive font-medium">{errors.address.message}</p>}
           </div>
           <div className="space-y-2">
              <Label>Ciudad, Estado, Zip</Label>
              <Input {...register('cityStateZip')} placeholder="MIAMI, FL 33122" />
              {errors.cityStateZip && <p className="text-[10px] text-destructive font-medium">{errors.cityStateZip.message}</p>}
           </div>
           <div className="space-y-2 text-primary">
              <Label>Teléfono del casillero</Label>
              <Input {...register('phone')} placeholder="+1 305-000-0000" />
              {errors.phone && <p className="text-[10px] text-destructive font-medium">{errors.phone.message}</p>}
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">3. Cuenta del Dueño del Negocio (Admin)</h3>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input {...register('adminName')} placeholder="Juan Pérez" />
              {errors.adminName && <p className="text-[10px] text-destructive font-medium">{errors.adminName.message}</p>}
           </div>
           <div className="space-y-2">
              <Label>Correo del administrador</Label>
              <Input type="email" {...register('adminEmail')} placeholder="admin@micourier.com" />
              {errors.adminEmail && <p className="text-[10px] text-destructive font-medium">{errors.adminEmail.message}</p>}
           </div>
           <div className="space-y-2">
              <Label>Contraseña</Label>
              <PasswordInput {...register('adminPassword')} />
              {errors.adminPassword && <p className="text-[10px] text-destructive font-medium">{errors.adminPassword.message}</p>}
           </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-lg shadow-lg font-bold" disabled={isLoading}>
        {isLoading ? 'Creando Empresa...' : 'Registrar Empresa y Plan'}
      </Button>

    </form>
  )
}
